var linq = require('linq');

// message types
var Commands = require('./Commands');
var Type = require('./Types');
var Builder = require('./Builder');
var MonitorId = require('./MonitorId');

var OperationType = {
  SET: "00",
  MOMENTARY: "01"
};

module.exports = function(message){
  var result = { err: null };

  var checksumByte = message.substr(message.length - 4, 2);
  var calculatedByte = Builder.calculateCheckCode(message.substr(2, message.length - 6));
  if(checksumByte != calculatedByte)
    return { err: "BAD_CHECKSUM" };

  message = parseHeader(message, result);
  message = message.substr(0, message.length - 4); // trim checksum and terminator

  if(result.err)
    return result;

  if(result.length != message.length/2)
    return { err: "BAD_LENGTH" };

  switch(result.type){
    case "GET_REPLY":
    case "SET_REPLY":
      parseGetSetReply(message, result);
    break;
    case "COMMAND_REPLY":
      parseCommandReply(message, result);
    break;
    default:
      return { err: "UNSUPPORTED_TYPE" };
  }

  return result;
};

function decodeHex(encoded){
  var hex = "";
  
  for(var i=0; i<encoded.length; i+=2){
    var b = encoded.substr(i, 2);
    var c = String.fromCharCode(parseInt(b, 16));

    hex += c;
  }

  return hex;
}

function parseHeader(message, result){
  // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
  var header = message.substr(0,7*2);

  var rawType = message.substr(4*2, 2);
  result.type = linq.from(Type).firstOrDefault(function(t){ return t.value == rawType; });
  if(result.type === null)
    return result.err = "BAD_TYPE";
  result.type = result.type.key;

  var rawLength = message.substr(5*2, 4);
  result.length = parseInt(decodeHex(rawLength), 16);
  
  return message.substr(14);
}

function parseGetSetReply(message, result){
  var rawResult = message.substr(1*2, 2*2); // chars 1+2
  var rawPage = message.substr(3*2, 2*2); // chars 3+4
  var rawCode = message.substr(5*2, 2*2); // chars 5+6
  var rawType = message.substr(7*2, 2*2); // chars 7+8
  var rawMaxValue = message.substr(9*2, 4*2); // chars 9-12
  var rawCurrentValue = message.substr(13*2, 4*2); // chars 13+14

  var commandResult = decodeHex(rawResult);
  var page = decodeHex(rawPage);
  var code = decodeHex(rawCode);
  var type = decodeHex(rawType);
  var maxValue = decodeHex(rawMaxValue);
  var currentValue = decodeHex(rawCurrentValue);

  //check result was good
  if(commandResult != "00")
    return result.err = "UNSUPPORTED_OPERATION";

  result.command = Commands.fromCodes(page, code);
  if(result.command === null)
    return result.err = "UNKNOWN_COMMAND";
  result.command = result.command.key;

  result.operationType = linq.from(OperationType).firstOrDefault(function(t){ return t.value == type; });
  if(result.operationType === null)
    return result.err = "UNKNOWN_OPERATION_TYPE";
  result.operationType = result.operationType.key;

  result.maxValue = maxValue;
  result.value = currentValue;
}

function parseCommandReply(message, result){
  var rawGroup = message.substr(1*2, 2*2); //chars 1+2
  var group = decodeHex(rawGroup);
  if(group == "02")
    message = message.substr(2*2); //trim first 2 chars

  rawGroup = message.substr(1*2, 2*2); //chars 1+2
  group = decodeHex(rawGroup);
  if(group == "01")
    return result.err = "UNSUPPORTED_OPERATION"
  if(group == "00")
    message = message.substr(2*2); //trim first 2 chars

  rawGroup = message.substr(1*2, 2*2); //chars 1+2
  group = decodeHex(rawGroup);
  var rawCommand = message.substr(3*2, 2*2); //chars 3+4
  var command = decodeHex(rawCommand);

  switch(group){
    case "D6": //get power
      parseGetPower(message, result);
    break;
    case "A1": //self diag
      console.log("SELF DIAG");
    break;
    case "C0":
      switch(command){

        default:
          return result.err = "UNKNOWN_COMMAND";
      }
    break;
    case "C1":
      switch(command){
        
        default:
          return result.err = "UNKNOWN_COMMAND";
      }
    break;
    case "C2":
      switch(command){
        case "03":
          parseSetPower(message, result);
        break;
        default:
          return result.err = "UNKNOWN_COMMAND";
      }
    break;
    case "C3":
      switch(command){
        case "16":
          parseGetSerial(message, result);
        break;
        case "17":
          parseGetModel(message, result);
        break;
        
        default:
          return result.err = "UNKNOWN_COMMAND";
      }
    break;
    default:
      return result.err = "UNKNOWN_COMMAND";
  }
}

function parseGetPower(message, result){
  var rawState = message.substr(9*2, 4*2); //chars 13-16
  var state = decodeHex(rawState);

  result.command = "POWER";
  result.state = linq.from(Commands.POWER_MODES).firstOrDefault(function(m){ return m.value == state; }, { key: 'UNKNOWN' }).key;
}

function parseSetPower(message, result){
  var rawState = message.substr(7*2, 4*2); //chars 13-16
  var state = decodeHex(rawState);

  result.command = "POWER";
  result.state = linq.from(Commands.POWER_MODES).firstOrDefault(function(m){ return m.value == state; }, { key: 'UNKNOWN' }).key;
}

function parseGetSerial(message, result){
  var length = result.length*2 - 6*2;
  var rawSerial = message.substr(5*2, length);
  var serial = decodeHex(rawSerial);

  var decodedSerial = decodeHex(serial);
  decodedSerial = decodedSerial.replace(/\0/g, '');

  result.command = "SERIAL";
  result.serial = decodedSerial;
}

function parseGetModel(message, result){
  var length = result.length*2 - 6*2;
  var rawModel = message.substr(5*2, length);
  var model = decodeHex(rawModel);

  var decodedName = decodeHex(model);
  decodedName = decodedName.replace(/\0/g, '');

  result.command = "MODEL";
  result.model = decodedName;
}
