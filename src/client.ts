import { EventEmitter } from 'events'
import { Socket } from 'net'
import { buildGetCommand } from './builder'
import { parseMessage } from './parser'

const DEFAULT_PORT = 7142

export interface NecOptions {
  debug?: false
}

export class NecClient extends EventEmitter {
  private readonly debug: boolean
  private readonly socket: Socket

  private _connected: boolean = false
  private _connectionActive: boolean = false // True when connected/connecting/reconnecting
  private _retryConnectTimeout: NodeJS.Timer | null = null
  private _host: string = ''
  private _id: number = 1

  constructor(options: NecOptions = {}) {
    super()

    this.debug = !!options.debug

    console.log(this._id, this.debug)

    this.socket = new Socket()
    // this.socket.setEncoding('ascii')
    this.socket.on('error', e => this.emit('error', e))
    this.socket.on('close', () => {
      console.log('close')
      //   if (this._connected) this.emit('disconnected')
      //   this._connected = false

      //   if (this._pingInterval) {
      //     clearInterval(this._pingInterval)
      //     this._pingInterval = null
      //   }

      //   this._triggerRetryConnection()
    })

    let receiveBuffer: Buffer[] = []
    this.socket.on('data', d => {
      // TMP hack
      if (receiveBuffer.length === 0) {
        receiveBuffer.push(d)
        return
      } else {
        d = Buffer.concat([receiveBuffer[0], d])
        receiveBuffer = []
      }

      console.log('data', d)

      try {
        const parsed = parseMessage(d)
        console.log('parsed', parsed)
      } catch (e) {
        console.error('parse errpr', e)
      }
    })

    this.socket.on('connect', () => {
      const test = buildGetCommand(this._id, 'MODEL') as Buffer

      console.log('sending', test.toString('hex'))
      this.socket.write(test.toString('hex'), 'hex')

      console.log('Connected')
    })
  }

  public connect(host: string, id: number) {
    if (this._connected || this._connectionActive) {
      return
    }
    this._connectionActive = true

    this._host = host
    this._id = id
    this._connectInner()
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

  private _connectInner() {
    // this._commandQueue = []
    // this._queueCommand(new DummyConnectCommand())
    //   .then(c => {
    //     // TODO - we can filter supported versions here. for now we shall not as it is likely that there will not be any issues
    //     // if (c.protocolVersion !== 1.6) {
    //     // 	throw new Error('unknown protocol version: ' + c.protocolVersion)
    //     // }

    //     if (this._pingPeriod > 0) {
    //       const cmd = new WatchdogPeriodCommand(1 + Math.round(this._pingPeriod / 1000))

    //       // force the command to send
    //       this._commandQueue = []
    //       const prom = this._queueCommand(cmd)
    //       this._sendQueuedCommand()
    //       return prom
    //         .then(() => {
    //           this._logDebug('ping: setting up')
    //           this._pingInterval = setInterval(() => {
    //             if (this.connected) this._performPing().catch(e => this.emit('error', e))
    //           }, this._pingPeriod)
    //         })
    //         .then(() => c)
    //     }

    //     return c
    //   })
    //   .then(c => {
    //     this._connected = true
    //     this.emit('connected', c)
    //   })
    //   .catch(e => {
    //     this._connected = false
    //     this.socket.end()
    //     this.emit('error', 'connection failed', e)
    //     this._log('connection failed', e)

    //     this._triggerRetryConnection()
    //   })

    this.socket.connect(DEFAULT_PORT, this._host)
  }
}
