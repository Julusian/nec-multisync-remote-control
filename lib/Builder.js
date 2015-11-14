var linq = require('linq');

// message types
var types = require('./Types');
var Commands = require('./Commands');

// control codes
var TERMINATOR = "0D";
var SOH = "01";
var HEADER_RESERVED = "30";
var SENDER_ID = "30";
var STX = "02";
var ETX = "03";

module.exports.get = function(id, command){
  var body = buildGetCommand(command.page, command.code);
  var primary = buildHeader(id, types.GET, body.length/2) + body;

  return SOH + primary + module.exports.calculateCheckCode(primary) + TERMINATOR;
}

module.exports.set = function(id, command, value){
  var body = buildSetCommand(command.page, command.code, value);
  var primary = buildHeader(id, types.SET, body.length/2) + body;

  return SOH + primary + module.exports.calculateCheckCode(primary) + TERMINATOR;
}

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

function buildHeader(id, type, length){
  // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
  var lengthString = encodeHex(length.toString(16));

  return HEADER_RESERVED + id + SENDER_ID + type + lengthString;
}

module.exports.calculateCheckCode = function(message){
  var code = parseInt(message[0]+message[1], 16);
  
  for(var i=2; i<message.length; i+=2){
    code ^= parseInt(message[i]+message[i+1], 16);
  }

  return padHex(code.toString(16));
}

function buildGetCommand(opcodePage, opcode){
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ 03
  return STX + encodeHex(opcodePage) + encodeHex(opcode) + ETX;
}

function buildSetCommand(opcodePage, opcode, value){
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ _V1_ _V2_ _V3_ _V4_ 03
  return STX + encodeHex(opcodePage) + encodeHex(opcode) + encodeHex(value) + ETX;
}

module.exports.saveSettings = function(id){
  var body = STX + encodeHex("0C") + ETX;
  var primary = buildHeader(id, types.COMMAND, body.length/2) + body;

  return SOH + primary + module.exports.calculateCheckCode(primary) + TERMINATOR;
};




module.exports.getPower = function(id){
  var body = STX + encodeHex("01D6") + ETX;
  var primary = buildHeader(id, types.COMMAND, body.length/2) + body;

  return SOH + primary + module.exports.calculateCheckCode(primary) + TERMINATOR;
}

module.exports.setPower = function(id, state){
  var commandCode = linq.from(Commands.POWER_MODES).firstOrDefault(function(m){ return m.key == state; }, { value: Commands.POWER_MODES['OFF'] }).value;

  var body = STX + encodeHex("C203D6") + encodeHex(commandCode) + ETX;
  var primary = buildHeader(id, types.COMMAND, body.length/2) + body;

  return SOH + primary + module.exports.calculateCheckCode(primary) + TERMINATOR;
}
