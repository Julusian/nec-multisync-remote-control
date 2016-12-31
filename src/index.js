import net from 'net-socket';
import { setInterval, setTimeout, clearInterval } from 'timers';

import { ParameterFromKey } from './parameters/index';
import { BuildGetParameter, BuildSetParameter, BuildGetCommand, BuildSetCommand } from './builder';
import { encodeHex } from './util';
import ParseMessage from './parser';
import { MonitorIdToHex } from './monitorid';
import MessageQueue from './messagequeue';

const DEFAULT_ID = "ALL";
const DEFAULT_PORT = 7142;
const TIMEOUT_INTERVAL = 100;
const RECEIVE_PART_TIMEOUT = 100;

export function Create(ip, monitorId, debug){
  if (monitorId === undefined)
    monitorId = DEFAULT_ID;

  monitorId = MonitorIdToHex(monitorId);
  if(monitorId == null){
    // console.log("Bad monitor id: "+id)
    return 'BAD_MONITOR';
  }

  return new NecControl(ip, monitorId, debug);
}

class NecControl {
  constructor(ip, monitorId, debug){
    this.ip = ip;
    this.monitorId = monitorId;
    this.debug = debug;
    this.events = [];
    this.client = null;

    this.receiveTimeout = null;
    this.receiveBuffer = "";

  }

  _debugLog(message){
    if (this.debug)
      console.log(message);
  }

  on(event, callback){
    this.events[event] = callback;

    if (this.client)
      this.client.on(event, callback);
  }

  connect(){
    if (this.client != null){
      this.client.end();
      this.client.unref();
      this.client.destroy();
      this.client = null;
    }

    if (this.timeoutInterval)
      clearInterval(this.timeoutInterval);

    this.client = net.connect(DEFAULT_PORT, this.ip);
    this.client.setEncoding('hex');

    this.messageQueue = new MessageQueue(this.client, (msg) => this._debugLog(msg));
    this.timeoutInterval = setInterval(() => this.messageQueue.checkTimeout(), TIMEOUT_INTERVAL);

    this.client.on('data', data => this._receivedMessage(data));
  }

  _receivedMessage(message){
    if (this.client == null)
      return;

    this._debugLog("Received message");

    if(this.receiveTimeout != null){
      this.receiveBuffer += message;
      return;
    }

    this.receiveBuffer = message;

    this.receiveTimeout = setTimeout(() => {
      this._debugLog("Processing message: " + this.receiveBuffer);

      const parseResult = ParseMessage(this.receiveBuffer);
      this.receiveTimeout = null;
      this.receiveBuffer = "";

      const promise = this.messageQueue.received();
      if (promise === null || promise === undefined)
        return;

      if(parseResult.err)
        return promise.reject(parseResult.err);

      this._debugLog("Message parsed successfully");
      promise.resolve(parseResult);
    }, RECEIVE_PART_TIMEOUT);    
  }

  close(){
    if(this.client == null)
      return;

    this._debugLog("Closing Connection");

    this.client.destroy();
  }

  getParameter(key){
    this._debugLog("Running get: " + key);

    const parameter = ParameterFromKey(key);
    if(parameter === null){
      return Promise.reject('BAD_KEY');
    }

    const message = BuildGetParameter(this.monitorId, parameter);
    return this.messageQueue.send(message);
  }

  //TODO - wrap value up properly
  setParameter(key, value){
    if (this.client == null)
      return;
    
    this._debugLog("Running set: " + key);

    const parameter = ParameterFromKey(key);
    if(parameter === null){
      return Promise.reject('BAD_KEY');
    }

    if(parameter.type == "range")
      value = encodeHex(value);

    const message = BuildSetParameter(this.monitorId, parameter, value);
    return this.messageQueue.send(message);
  }

  getCommand(command){
    if (this.client == null)
      return;
    
    this._debugLog("Running getCommand: " + command);

    const message = BuildGetCommand(this.monitorId, command);
    if(message === undefined || message === null)
      return Promise.reject('NO_MESSAGE');

    return this.messageQueue.send(message);
  }

  setCommand(command, data){
    if (this.client == null)
      return;
    
    this._debugLog("Running setCommand: " + command);

    const message = BuildSetCommand(this.monitorId, command, data);
    if(message === undefined || message === null)
      return Promise.reject('NO_MESSAGE');

    return this.messageQueue.send(message);
  }

  sendRAW(message){
    if (this.client == null)
      return;
    
    if(message === undefined || message === null)
      return Promise.reject('NO_MESSAGE');

    this._debugLog("Sending raw");

    return this.messageQueue.send(message);
  }


}