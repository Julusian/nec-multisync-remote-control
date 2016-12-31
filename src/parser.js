import { MessageType, OperationType, PowerMode } from './types';
import { decodeHex } from './util';
import { Parameters } from './parameters';
import { CalculateCheckCode } from './builder';

const HEADER_LENGTH = 7 * 2;


export default function(message){
  const parser = new Parser(message);

  if (!parser.checkChecksum())
    return parser.result;

  if (!parser.parseHeader())
    return parser.result;

  if (!parser.parseBody())
    return parser.result;

  return parser.result;
}

class Parser {
  constructor(message){
    this.message = message;
    this.result = { err: null };
  }

  setError(err){
    this.result.err = err;
    return false;
  }

  checkChecksum(){
    if (this.result.err != null)
      return false;

    const checksumByte = this.message.substr(this.message.length - 4, 2);
    const calculatedByte = CalculateCheckCode(this.message.substr(2, this.message.length - 6));
    if(checksumByte != calculatedByte)
      return this.setError("BAD_CHECKSUM");

    return true;
  }

  parseHeader(){
    if (this.result.err != null)
      return false;

    // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
    const header = this.message.substr(0, HEADER_LENGTH);

    const rawTypeValue = header.substr(4*2, 2);
    for (let key of Object.keys(MessageType)) {
      if (MessageType[key] == rawTypeValue)
        this.result.type = key;
    }

    if (this.result.type === undefined || this.result.type == null)
      return this.setError("BAD_TYPE");

    const rawLength = header.substr(5*2, 4);
    this.result.length = parseInt(decodeHex(rawLength), 16);
  
    return true;
  }

  parseBody(){
    if (this.result.err != null)
      return false;

    const body = this.message.substr(HEADER_LENGTH, this.message.length - 4 - HEADER_LENGTH);

    if(this.result.length != body.length/2)
      return this.setError("BAD_LENGTH");

    switch(this.result.type){
      case "GET_REPLY":
      case "SET_REPLY":
        this.parseParameterReply(body);
      break;
      case "COMMAND_REPLY":
        this.parseCommandReply(body);
      break;
      default:
        return this.setError("UNSUPPORTED_TYPE");
    }

    return true;
  }

  parseParameterReply(body){
    const rawResult       = body.substr(1*2, 2*2); // chars 1+2
    const rawPage         = body.substr(3*2, 2*2); // chars 3+4
    const rawCode         = body.substr(5*2, 2*2); // chars 5+6
    const rawType         = body.substr(7*2, 2*2); // chars 7+8
    const rawMaxValue     = body.substr(9*2, 4*2); // chars 9-12
    const rawCurrentValue = body.substr(13*2, 4*2); // chars 13+14

    const commandResult = decodeHex(rawResult);
    const page          = decodeHex(rawPage);
    const code          = decodeHex(rawCode);
    const type          = decodeHex(rawType);
    const maxValue      = decodeHex(rawMaxValue);
    const currentValue  = decodeHex(rawCurrentValue);

    //check result was good
    if(commandResult != "00")
      return this.setError("UNSUPPORTED_OPERATION");

    const commandType = Parameters.fromCodes(page, code);
    if(commandType === null)
      return this.setError("UNKNOWN_COMMAND");
    this.result.command = commandType.key;

    // parse the operation type
    for (let key of Object.keys(OperationType)) {
      if (OperationType[key] == type)
        this.result.operationType = key;
    }
    if (this.result.operationType === undefined || this.result.operationType == null)
      return this.setError("UNKNOWN_OPERATION_TYPE");

    this.result.maxValue = maxValue;
    this.result.value = currentValue;

    if(commandType.value.type == "range")
      this.result.value = parseInt(this.result.value, 16);

    return true;
  }


  parseCommandReply(body){
    let rawGroup = body.substr(1*2, 2*2); //chars 1+2
    let group = decodeHex(rawGroup);
    if(group == "02")
      body = body.substr(2*2); //trim first 2 chars

    rawGroup = body.substr(1*2, 2*2); //chars 1+2
    group = decodeHex(rawGroup);
    if(group == "01")
      return this.setState("UNSUPPORTED_OPERATION");
    if(group == "00")
      body = body.substr(2*2); //trim first 2 chars

    rawGroup = body.substr(1*2, 2*2); //chars 1+2
    group = decodeHex(rawGroup);

    const rawCommand = body.substr(3*2, 2*2); //chars 3+4
    const command = decodeHex(rawCommand);

    switch(group){
      case "D6": //get power
        this.parseGetPower(body);
      break;
      case "A1": //self diag
        // TODO 
        // console.log("SELF DIAG");
      break;
      case "C0":
        switch(command){
          // TODO 

          default:
            return this.setError("UNKNOWN_COMMAND");
        }
      case "C1":
        switch(command){
          // TODO 
          
          default:
            return this.setError("UNKNOWN_COMMAND");
        }
      case "C2":
        switch(command){
          case "03":
            this.parseSetPower(body);
          break;
          default:
            return this.setError("UNKNOWN_COMMAND");
        }
      break;
      case "C3":
        switch(command){
          case "16":
            this.parseGetSerial(body);
          break;
          case "17":
            this.parseGetModel(body);
          break;
          
          default:
            return this.setError("UNKNOWN_COMMAND");
        }
      break;
      default:
        return this.setError("UNKNOWN_COMMAND");
    }
  }

  parseGetPower(body){
    const rawState = body.substr(9*2, 4*2); //chars 15-18
    return this.parsePowerHelper(rawState);
  }

  parseSetPower(body){
    const rawState = body.substr(7*2, 4*2); //chars 13-16
    return this.parsePowerHelper(rawState);
  }

  parsePowerHelper(rawState){
    const state = decodeHex(rawState);

    this.result.command = "POWER";
    this.result.state = "UNKNOWN";
    for (let key of Object.keys(PowerMode)) {
      if (PowerMode[key] == state) {
        this.result.state = key;
        return;
      }
    }
  }

  parseGetSerial(body){
    const length = this.result.length*2 - 6*2;
    const rawSerial = body.substr(5*2, length);
    const serial = decodeHex(rawSerial);

    this.result.command = "SERIAL";
    this.result.serial = decodeHex(serial).replace(/\0/g, '');
  }

  parseGetModel(body){
    const length = this.result.length*2 - 6*2;
    const rawModel = body.substr(5*2, length);
    const model = decodeHex(rawModel);

    this.result.command = "MODEL";
    this.result.model = decodeHex(model).replace(/\0/g, '');
  }


}