import { padHex, encodeHex } from './util';
import { MessageType, PowerMode } from './types';

// control codes
const TERMINATOR = "0D";
const SOH = "01";
const HEADER_RESERVED = "30";
const SENDER_ID = "30";
const STX = "02";
const ETX = "03";

export function BuildGetParameter(id, command){
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ 03
  const body = STX + encodeHex(command.page) + encodeHex(command.code) + ETX;
  const header = buildHeader(id, MessageType.GET, body.length/2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

export function BuildSetParameter(id, command, value){
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ _V1_ _V2_ _V3_ _V4_ 03
  const body = STX + encodeHex(command.page) + encodeHex(command.code) + encodeHex(value) + ETX;
  const header = buildHeader(id, MessageType.SET, body.length/2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}


export function BuildGetCommand(id, command){
  let encodedCommand;
  switch(command){
    case "SERIAL":
      encodedCommand = encodeHex("C216");
    break;
    case "MODEL":
      encodedCommand = encodeHex("C217");
    break;
    case "POWER":
      encodedCommand = encodeHex("01D6");
    break;
    default:
      return null;
  }

  const body = STX + encodedCommand + ETX;
  const header = buildHeader(id, MessageType.COMMAND, body.length/2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

export function BuildSetCommand(id, command, data){
  let encodedCommand;
  switch(command){
    case "POWER":
      encodedCommand = encodeHex("C203D6") + encodeHex(getPowerMode(data));
    break;
    // TODO - other types
    default:
      return null;
  }

  const body = STX + encodedCommand + ETX;
  const header = buildHeader(id, MessageType.COMMAND, body.length/2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

function getPowerMode(key){
  let powerMode = PowerMode[key];
  if (!powerMode)
    powerMode = PowerMode['OFF'];

  return powerMode;
}

export function BuildSaveSettings(id){
  const body = STX + encodeHex("0C") + ETX;
  const header = buildHeader(id, MessageType.COMMAND, body.length/2);

  return SOH + header + body + CalculateCheckCode(header + body) + TERMINATOR;
}

function buildHeader(id, type, length){
  // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
  const lengthString = encodeHex(length.toString(16));

  return HEADER_RESERVED + id + SENDER_ID + type + lengthString;
}

export function CalculateCheckCode(message){
  let code = parseInt(message[0]+message[1], 16);
  
  for(let i=2; i<message.length; i+=2){
    code ^= parseInt(message[i]+message[i+1], 16);
  }

  return padHex(code.toString(16));
}

