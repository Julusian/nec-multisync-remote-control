import { EventEmitter } from 'events'
import { Socket } from 'net'
import * as objectPath from 'object-path'
import * as _ from 'underscore'
import { buildMessage } from './builder'
import { COMMANDS, SomeCommandSpec } from './commands'
import { MessageType, MONITOR_ID_ALL, MonitorId } from './enums'
import { convertMonitorId } from './id'
import { ParsedHeaderInfo, parseMessage, parseMessageHeader } from './parser'
import { assertUnreachable } from './util'

const DEFAULT_PORT = 7142
const MESSAGE_TIMEOUT = 1000

export interface NecOptions {
  debug?: false
}

interface MessageQueueEntry {
  commandId: number[]
  payload: Buffer
  resolve: (res: string | number) => void
  reject: (err: any) => void
  sendTime?: number
}

export class NecClient extends EventEmitter {
  private readonly debug: boolean
  private readonly socket: Socket

  private receivedBuffers: Buffer[] = []
  private messageQueue: MessageQueueEntry[] = []
  private inFlightMessage: MessageQueueEntry | undefined
  private inFlightTimeout: NodeJS.Timer | undefined

  private _connected: boolean = false
  private _connectionActive: boolean = false // True when connected/connecting/reconnecting
  private _retryConnectTimeout: NodeJS.Timer | null = null
  private _host: string = ''
  private _id: number = MONITOR_ID_ALL.charCodeAt(0)

  constructor(options: NecOptions = {}) {
    super()

    this.debug = !!options.debug

    console.log(this.debug)

    this.socket = new Socket()
    // this.socket.setEncoding('ascii')
    this.socket.on('error', e => this.emit('error', e))
    this.socket.on('close', () => {
      console.log('close')
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
      oldMessages.forEach(msg => msg.reject('disconnected'))

      //   if (this._pingInterval) {
      //     clearInterval(this._pingInterval)
      //     this._pingInterval = null
      //   }

      //   this._triggerRetryConnection()
    })

    this.socket.on('data', d => this._handleReceivedData(d))

    this.socket.on('connect', () => {
      console.log('Connected')

      this._connected = true

      this.emit('connected')
    })
  }

  public connect(host: string, id: MonitorId) {
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

  public disconnect(): Promise<void> {
    this._connectionActive = false
    if (this._retryConnectTimeout) {
      clearTimeout(this._retryConnectTimeout)
    }

    if (!this._connected) {
      return Promise.resolve()
    }

    return new Promise(async (resolve, reject) => {
      try {
        // await this.sendCommand(new QuitCommand())
        this.socket.end()
        return resolve()
      } catch (e) {
        return reject(e)
      }
    })
  }

  public sendGetStringCommand(command: 'MODEL' | 'SERIAL'): Promise<string | number> {
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

  public sendGetCommand(command: 'POWER'): Promise<number> {
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

  public sendSetCommand(command: 'POWER', value: number): Promise<number> {
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

  public sendGetByKey(key: string): Promise<number> {
    const spec = objectPath.get<SomeCommandSpec | undefined>(COMMANDS, key, undefined)
    if (spec === undefined) {
      throw new Error(`Invalid key: "${key}"`)
    }

    return this.sendGetBySpec(spec)
  }

  public sendGetBySpec(spec: SomeCommandSpec): Promise<number> {
    const payload = buildMessage(this._id, MessageType.Get, [spec.page, spec.code])
    return this._queueMessage([spec.page, spec.code], payload)
  }

  public sendSetByKey(key: string, value: number): Promise<number> {
    const spec = objectPath.get<SomeCommandSpec | undefined>(COMMANDS, key, undefined)
    if (spec === undefined) {
      throw new Error(`Invalid key: "${key}"`)
    }

    return this.sendSetBySpec(spec, value)
  }

  public sendSetBySpec(spec: SomeCommandSpec, value: number): Promise<number> {
    // TODO - validate value?

    const payload = buildMessage(this._id, MessageType.Set, [spec.page, spec.code], [value])
    return this._queueMessage([spec.page, spec.code], payload)
  }

  private _queueMessage(commandId: number[], payload: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      this.messageQueue.push({
        commandId,
        payload,
        resolve,
        reject
      })
      this._trySendQueued()
    })
  }

  private _handleReceivedData(data: Buffer) {
    const headerInfo = parseMessageHeader(data)
    if (headerInfo) {
      // Start of new message
      if (this.receivedBuffers.length !== 0) {
        console.log('Received new header with some buffers to finish off')
        this._tryCompleteReceivedData(undefined, true)
        this.receivedBuffers = []
      }

      //   console.log('new header packet')
      this.receivedBuffers.push(data)
      this._tryCompleteReceivedData(headerInfo, false)
    } else {
      if (this.receivedBuffers.length === 0) {
        console.log('Received middle packet with no waiting header')
      }
      this.receivedBuffers.push(data)
      this._tryCompleteReceivedData(undefined, false)
    }
  }

  private _tryCompleteReceivedData(headerInfo: ParsedHeaderInfo | undefined, errorOnFailure: boolean) {
    const headerBuffer = _.first(this.receivedBuffers)
    if (headerBuffer) {
      headerInfo = headerInfo || (parseMessageHeader(headerBuffer) as ParsedHeaderInfo)

      const buffersLength = this.receivedBuffers.map(b => b.length).reduce((a, b) => a + b, 0)
      if (buffersLength >= headerInfo.totalLength) {
        let fullData = Buffer.concat(this.receivedBuffers)
        this.receivedBuffers = []

        if (fullData.length > headerInfo.totalLength) {
          console.log(`Received buffers too long. Discarding ${fullData.length - headerInfo.totalLength} bytes`)
          fullData = fullData.slice(0, headerInfo.totalLength)
        }

        this._parseReceivedData(fullData)
      } else if (errorOnFailure) {
        console.log(`Discarding ${this.receivedBuffers.length} buffers with not enough data`)
        this.receivedBuffers = []
      }

      //   console.log('buffers to process', this.receivedBuffers.length)
    }
  }

  private _parseReceivedData(fullData: Buffer) {
    if (this.inFlightTimeout) {
      clearTimeout(this.inFlightTimeout)
      this.inFlightTimeout = undefined
    }

    const msg = this.inFlightMessage
    this.inFlightMessage = undefined
    if (!msg) {
      console.error('received data with nothing inflight')
      return
    }

    try {
      const parsed = parseMessage(msg.commandId, fullData)
      // console.log('result:', parsed)
      msg.resolve(parsed)
    } catch (e) {
      console.error('parse error', e)
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
          console.log('Timeout waiting for response')
          // TODO - this should reject the inFlight promise, but should it close the connection, as stuff will be mismatched?
        }, MESSAGE_TIMEOUT)
      }
    }
  }
}