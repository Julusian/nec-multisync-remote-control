
const TIMEOUT = 5000;

export default class MessageQueue {
  constructor(client, debugLog){
    this.client = client;
    this.debugLog = debugLog;
    this.queue = [];
  }

  send(message){
    return new Promise((resolve, reject) => {
      const promise = { resolve, reject };

      this.queue.push({
        message: message,
        promise: promise,
        sent: false,
        time: Date.now()
      });

      this.debugLog("Queued message");
      this.debugLog(this.queue.length + " message in queue");

      this._trySend();
    });
  }

  _trySend(){
    if(this.queue.length == 0)
      return false;

    const message = this.queue[0];
    if(message.sent){
      this.debugLog("Message queued");
      return false;
    }

    message.sent = true;
    this.debugLog("Sending: " + message.message);
    this.client.write(message.message, "hex", () => {
      //erm.. anything needed here?
      this.debugLog("Message sent");
    });
    return true;
  }

  received (){
    if(this.queue.length == 0)
      return null;

    this.debugLog("Received message");
    const message = this.queue.shift();

    this._trySend();

    return message.promise;
  }

  checkTimeout(){
    if(this.queue.length == 0)
      return false;

    const message = this.queue[0];
    if(message.sent)
      return false; 

    if(message.time <= Date.now()-TIMEOUT){
      this.queue.shift();

      this.debugLog("Timeout waiting for response");
      message.promise.reject('TIMEOUT');

      return this._trySend();
    }

    return true;
  }
}