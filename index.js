var net = require('net');
var _ = require('underscore');

var MonitorId = require('./lib/MonitorId');
var MessageQueue = require('./lib/messageQueue');
var MessageBuilder = require('./lib/Builder');
var MessageParser = require('./lib/Parser');
var Commands = require('./lib/Commands');

var DEFAULT_ID = "ALL";
var DEFAULT_PORT = 7142;
var INTERVAL = 100;
var RECEIVE_PART_TIMEOUT = 100;

module.exports = function(){
  var client = null;
  var monitorId = null;
  var timeoutInterval = null;
  var messageQueue = MessageQueue();

  var receiveBuffer = "";
  var receiveTimeout = null;

  function receivedMessage(message){
    console.log("Received message");

    if(receiveTimeout != null){
      receiveBuffer += message;
      return;
    }

    receiveBuffer = message;

    receiveTimeout = setTimeout(function(){
      console.log("Processing message: "+receiveBuffer);

      receiveTimeout = null;

      var callback = messageQueue.received(client);
      if(callback === null || callback === undefined)
        return false;

      var parseResult = MessageParser(receiveBuffer);
      if(parseResult.err)
        return callback(parseResult.err);

      console.log("Message parsed successfully");
      callback(undefined, parseResult);
    }, RECEIVE_PART_TIMEOUT);    
  }

  return {
    connect: function(ip, id, callback){
      if (_.isFunction(id)){
        callback = id;
        id = DEFAULT_ID;
      } else if(id === undefined)
        id = DEFAULT_ID;
      if(callback === undefined)
        callback = function(){};

      if (client != null){
        client.end();
        client.unref();
        client.destroy();
      }

      timeoutInterval = setInterval(messageQueue.checkTimeout, INTERVAL);

      monitorId = MonitorId.convert(id);
      if(monitorId == null){
        console.log("Bad monitor id: "+id)
        return callback('BAD_MONITOR');
      }
      console.log("Using monitor id: "+id)

      client = net.connect(DEFAULT_PORT, ip, callback);
      client.setEncoding('hex');

      client.on('connect', function(){
        console.log("Connected");
      });
      client.on('data', receivedMessage);
      client.on('close', function(){
        client = null;

        console.log("Connection closed");
      });
      client.on('end', this.close);

      return client;
    },

    close: function(){
      if(client == null)
        return;

      console.log("Closing Connection");

      client.destroy();
    },

    get: function(key, callback){
      if(callback === undefined) callback = function(){};

      console.log("Running get: "+key);

      var command = Commands.fromKey(key);
      if(command === null){
        console.log("Bad key");
        return callback('BAD_KEY');
      }

      var message = MessageBuilder.get(monitorId, command);
      return messageQueue.send(client, message, callback);
    },

    //TODO - wrap value up properly
    set: function(key, value, callback){
      if(callback === undefined) callback = function(){};

      console.log("Running set: "+key);

      var command = Commands.fromKey(key);
      if(command === null){
        console.log("Bad key");
        return callback('BAD_KEY');
      }

      //TODO - use these from elsewhere
      function padHex(hex){
        return (hex.length == 1) ? "0" + hex : hex;
      }
      function encodeHex(hex){
        hex = padHex(hex);
        var encoded = "";
        
        for(var i=0; i<hex.length; i++){
          encoded += padHex(hex.charCodeAt(i).toString(16));
        }

        return encoded;
      }

      if(command.type == "range")
        value = encodeHex(value);

      var message = MessageBuilder.set(monitorId, command, value);
      return messageQueue.send(client, message, callback);
    },

    getCommand: function(command, callback){
      if(callback === undefined) callback = function(){};

      console.log("Running getCommand: "+command);

      var message = MessageBuilder.getCommand(monitorId, command);

      if(message === undefined || message === null)
        return callback('NO_MESSAGE');

      return messageQueue.send(client, message, callback);
    },

    setCommand: function(command, data, callback){
      if(callback === undefined) callback = function(){};

      console.log("Running setCommand: "+command);

      var message = MessageBuilder.getCommand(monitorId, command, data);

      if(message === undefined || message === null)
        return callback('NO_MESSAGE');

      return messageQueue.send(client, message, callback);
    },

    sendRAW: function(message, callback){
      if(callback === undefined) callback = function(){};

      if(message === undefined || message === null)
        return callback('NO_MESSAGE');

      console.log("Sending raw");

      return messageQueue.send(client, message, callback);
    },

    allCommands: function(){
      return Commands.COMMANDS;
    },

    flattenCommands: function(){
      var result = {};

      function flatten(key, tree, result){
        if(tree.page || tree.code || tree.type)
          return result[key] = tree;

        if(key.length > 0)
          key += ".";

        for(var i in tree){
          flatten(key + i, tree[i], result);
        }
      }

      flatten("", Commands.COMMANDS, result);
      return result;
    }
  };
};
