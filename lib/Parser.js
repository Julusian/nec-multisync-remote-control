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
	var rawResult = message.substr(1*2, 2*2);
	var rawPage = message.substr(3*2, 2*2);
	var rawCode = message.substr(5*2, 2*2);
	var rawType = message.substr(7*2, 2*2);
	var rawMaxValue = message.substr(9*2, 4*2);
	var rawCurrentValue = message.substr(13*2, 4*2);

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


//console.log(module.exports("01303041443132023030303031303030303036343030363403060d"));
