
var TIMEOUT = 5000;

module.exports = function(){
  var queue = [];

  function trySend(client){
    if(queue.length == 0)
      return false;

    var message = queue[0];
    if(message.sent){
      console.log("Message queued");
      return false;
    }

    message.sent = true;
    console.log("Sending: "+message.message);
    client.write(message.message, "hex", function(){
      //erm.. anything needed here?
      console.log("Message sent");
    });
    return true;
  }

  return {
    send: function(client, message, callback){
      queue.push({
        message: message,
        callback: callback,
        sent: false,
        time: Date.now()
      });

      console.log("Queued message");
      console.log(queue.length+" message in queue");

      trySend(client);
    },

    received: function (client){
      if(queue.length == 0)
        return null;

      console.log("Received message");

      var message = queue.shift();

      trySend(client);

      return message.callback;
    },

    checkTimeout: function(client){
      if(queue.length == 0)
        return false;

      var message = queue[0];
      if(message.sent)
        return false; 

      if(message.time <= Date.now()-TIMEOUT){
        queue.shift();

        console.log("Timeout waiting for response");
        message.callback('TIMEOUT');

        return trySend(client);
      }

      return true;
    }
  };
};
