import { EventEmitter } from 'node:events'
import { Socket } from 'node:net'
import objectPath from 'object-path'
import { buildMessage } from './builder.js'
import { COMMANDS, SomeCommandSpec } from './commands.js'
import { MessageType, MONITOR_ID_ALL, MonitorId } from './enums.js'
import { convertMonitorId } from './id.js'
import { ParsedHeaderInfo, parseMessage, parseMessageHeader } from './parser.js'
import { assertUnreachable } from './util.js'

const DEFAULT_PORT = 7142
const MESSAGE_TIMEOUT = 1000

export interface NecOptions {
	debug?: boolean
}

interface MessageQueueEntry {
	commandId: number[]
	payload: Buffer
	resolve: (res: string | number) => void
	reject: (err: any) => void
	sendTime?: number
}

export type NecClientEvents = {
	error: [message: any]
	log: [message: string]
	connected: []
	disconnected: []
}

export class NecClient extends EventEmitter<NecClientEvents> {
	private readonly debug: boolean
	private readonly socket: Socket

	private receiveBuffer: Buffer = Buffer.alloc(0)
	private messageQueue: MessageQueueEntry[] = []
	private inFlightMessage: MessageQueueEntry | undefined
	private inFlightTimeout: NodeJS.Timeout | undefined

	private _connected = false
	private _connectionActive = false // True when connected/connecting/reconnecting
	private _retryConnectTimeout: NodeJS.Timeout | null = null
	private _host = ''
	private _id: number = MONITOR_ID_ALL.charCodeAt(0)

	constructor(options: NecOptions = {}) {
		super()

		this.debug = !!options.debug

		this.socket = new Socket()
		// this.socket.setEncoding('ascii')
		this.socket.on('error', (e) => this.emit('error', e))
		this.socket.on('close', () => {
			if (this.debug) {
				this.emit('log', 'Connection closed')
			}

			if (this._connected) {
				this.emit('disconnected')
			}
			this._connected = false

			if (this.inFlightTimeout) {
				clearTimeout(this.inFlightTimeout)
				this.inFlightTimeout = undefined
			}
			if (this.inFlightMessage) {
				this.inFlightMessage.reject('disconnected')
				this.inFlightMessage = undefined
			}
			const oldMessages = this.messageQueue
			this.messageQueue = []
			oldMessages.forEach((msg) => msg.reject('disconnected'))

			//   if (this._pingInterval) {
			//     clearInterval(this._pingInterval)
			//     this._pingInterval = null
			//   }

			if (!this._retryConnectTimeout) {
				this._retryConnectTimeout = setTimeout(() => {
					this._retryConnectTimeout = null
					this.emit('log', 'Trying reconnect')
					this.socket.connect(DEFAULT_PORT, this._host)
				}, 1000)
			}
		})

		this.socket.on('data', (d) => this._handleReceivedData(d))

		this.socket.on('connect', () => {
			if (this.debug) {
				this.emit('log', 'Connected')
			}

			this._connected = true

			this.emit('connected')
		})
	}

	public connect(host: string, id: MonitorId): void {
		if (this._connected || this._connectionActive) {
			return
		}
		this._connectionActive = true

		const validatedId = convertMonitorId(id)
		if (validatedId === undefined) {
			throw new Error(`Invalid monitor/group id ${id}`)
		}

		this._host = host
		this._id = validatedId
		this.socket.connect(DEFAULT_PORT, this._host)
	}

	public async disconnect(): Promise<void> {
		this._connectionActive = false
		if (this._retryConnectTimeout) {
			clearTimeout(this._retryConnectTimeout)
			this._retryConnectTimeout = null
		}

		if (!this._connected) {
			return Promise.resolve()
		}

		return new Promise((resolve, reject) => {
			try {
				// await this.sendCommand(new QuitCommand())
				this.socket.end()
				return resolve()
			} catch (e) {
				return reject(e as Error)
			}
		})
	}

	public async sendGetStringCommand(command: 'MODEL' | 'SERIAL'): Promise<string | number> {
		let sendCommand: number[]
		let response: number[]
		switch (command) {
			case 'SERIAL':
				sendCommand = [0xc2, 0x16]
				response = [0xc3, 0x16]
				break
			case 'MODEL':
				sendCommand = [0xc2, 0x17]
				response = [0xc3, 0x17]
				break
			default:
				assertUnreachable(command)
				throw new Error(`Unknown command: ${command}`)
		}

		const payload = buildMessage(this._id, MessageType.Command, sendCommand)
		return this._queueMessage(response, payload)
	}

	public async sendGetCommand(command: 'POWER'): Promise<number> {
		let sendCommand: number[]
		let response: number[]
		switch (command) {
			case 'POWER':
				sendCommand = [0x01, 0xd6]
				response = [0xd6]
				break
			default:
				assertUnreachable(command)
				throw new Error(`Unknown command: ${command}`)
		}

		const payload = buildMessage(this._id, MessageType.Command, sendCommand)
		return this._queueMessage(response, payload)
	}

	public async sendSetCommand(command: 'POWER', value: number): Promise<number> {
		let codes: number[]
		switch (command) {
			case 'POWER':
				codes = [0xc2, 0x03, 0xd6]
				break
			default:
				assertUnreachable(command)
				throw new Error(`Unknown command: ${command}`)
		}

		const payload = buildMessage(this._id, MessageType.Command, codes, [0x00, value])
		return this._queueMessage(codes, payload)
	}

	public async sendGetByKey(key: string): Promise<number> {
		const spec = objectPath.get<SomeCommandSpec | undefined>(COMMANDS, key, undefined)
		if (spec === undefined) {
			throw new Error(`Invalid key: "${key}"`)
		}

		return this.sendGetBySpec(spec)
	}

	public async sendGetBySpec(spec: SomeCommandSpec): Promise<number> {
		const payload = buildMessage(this._id, MessageType.Get, [spec.page, spec.code])
		return this._queueMessage([spec.page, spec.code], payload)
	}

	public async sendSetByKey(key: string, value: number): Promise<number> {
		const spec = objectPath.get<SomeCommandSpec | undefined>(COMMANDS, key, undefined)
		if (spec === undefined) {
			throw new Error(`Invalid key: "${key}"`)
		}

		return this.sendSetBySpec(spec, value)
	}

	public async sendSetBySpec(spec: SomeCommandSpec, value: number): Promise<number> {
		// TODO - validate value?

		const payload = buildMessage(this._id, MessageType.Set, [spec.page, spec.code], [value])
		return this._queueMessage([spec.page, spec.code], payload)
	}

	private async _queueMessage(commandId: number[], payload: Buffer): Promise<any> {
		return new Promise((resolve, reject) => {
			this.messageQueue.push({
				commandId,
				payload,
				resolve,
				reject,
			})
			this._trySendQueued()
		})
	}

	private _handleReceivedData(data: Buffer) {
		// Append incoming data to the continuous receive buffer
		if (this.receiveBuffer.length > 0) {
			this.receiveBuffer = Buffer.concat([this.receiveBuffer, data])
		} else {
			this.receiveBuffer = data
		}

		// Try to parse and process complete messages
		this._tryCompleteReceivedData()
	}

	private _tryCompleteReceivedData() {
		// Continuously parse complete messages from the buffer
		while (this.receiveBuffer.length > 0) {
			// Need at least 6 bytes to parse a header (SOH + reserved + deviceId + reserved + type + bodyLength)
			if (this.receiveBuffer.length < 7) {
				break
			}

			// Try to parse header from the beginning of the buffer
			const headerInfo = parseMessageHeader(this.receiveBuffer)

			if (!headerInfo) {
				// No valid header at start - discard one byte and try again
				if (this.debug) {
					this.emit(
						'log',
						`No valid header at position 0, discarding byte: 0x${this.receiveBuffer.readUInt8(0).toString(16)}`
					)
				}
				this.receiveBuffer = this.receiveBuffer.subarray(1)
				continue
			}

			// Check if we have the complete message
			if (this.receiveBuffer.length < headerInfo.totalLength) {
				// Not enough data yet, wait for more
				break
			}

			// Extract the complete message
			const messageData = this.receiveBuffer.subarray(0, headerInfo.totalLength)
			this.receiveBuffer = this.receiveBuffer.subarray(headerInfo.totalLength)

			// Parse and handle the message
			this._parseReceivedData(headerInfo, messageData)
		}
	}

	private _parseReceivedData(headerInfo: ParsedHeaderInfo, fullData: Buffer) {
		if (this.inFlightTimeout) {
			clearTimeout(this.inFlightTimeout)
			this.inFlightTimeout = undefined
		}

		const msg = this.inFlightMessage
		this.inFlightMessage = undefined
		if (!msg) {
			this.emit('log', 'received data with nothing inflight')
			return
		}

		try {
			const parsed = parseMessage(headerInfo, msg.commandId, fullData)
			// console.log('result:', parsed)
			msg.resolve(parsed)
		} catch (e) {
			this.emit('log', `Parse error: ${e}`)
			msg.reject(e)
		}
		this._trySendQueued()
	}

	private _trySendQueued() {
		if (!this.inFlightMessage && this._connected) {
			this.inFlightMessage = this.messageQueue.shift()
			if (this.inFlightMessage) {
				// console.log('sending')
				this.socket.write(this.inFlightMessage.payload)
				this.inFlightTimeout = setTimeout(() => {
					this.emit(
						'log',
						`Timeout waiting for response for: ${this.inFlightMessage ? this.inFlightMessage.commandId : '-'}`
					)
					// TODO - this should reject the inFlight promise, but should it close the connection, as stuff will be mismatched?
					if (this.inFlightMessage) {
						this.inFlightMessage.reject(new Error('Timed out'))
						this.inFlightMessage = undefined
						this._trySendQueued()
					}
				}, MESSAGE_TIMEOUT)
			}
		}
	}
}
