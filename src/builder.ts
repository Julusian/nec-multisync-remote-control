import { ETX, HEADER_RESERVED, SENDER_ID, SOH, STX, TERMINATOR } from './constants'
import { MessageType } from './enums'
import { encodeToHexBytes } from './util'

export interface CommandSpec {
  code: number
  page: number
}

export function buildGet(id: number, command: CommandSpec) {
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ 03
  const body = Buffer.alloc(6)
  body.writeUInt8(STX, 0)
  body.writeUInt16LE(command.page, 1)
  body.writeUInt16LE(command.code, 3)
  body.writeUInt8(ETX, 5)

  const header = buildHeader(id, MessageType.Get, body.length)

  return wrapWithCheckCode(Buffer.concat([header, body]))
}

export function buildSet(id: number, command: CommandSpec, value: number): Buffer {
  // in hex: 02 _OCP1_ _OCP2_ _OP1_ _OP2_ _V1_ _V2_ _V3_ _V4_ 03
  const body = Buffer.alloc(10)
  body.writeUInt8(STX, 0)
  body.writeUInt16LE(command.page, 1)
  body.writeUInt16LE(command.code, 3)
  body.writeUInt32LE(value, 5)
  body.writeUInt8(ETX, 9)

  const header = buildHeader(id, MessageType.Set, body.length)

  return wrapWithCheckCode(Buffer.concat([header, body]))
}

function buildHeader(id: number, type: MessageType, length: number): Buffer {
  if (length > 0xff) {
    // The encoding limits it to 1 byte of data
    throw new Error('Body length too long')
  }

  // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
  const buffer = Buffer.from([
    HEADER_RESERVED,
    id,
    SENDER_ID,
    type,
    // Length wants to be encoded as a hex string
    ...encodeToHexBytes(length)
  ])

  return buffer
}

export function calculateCheckCode(message: Buffer): number {
  let code = message.readUInt8(0)
  for (let i = 1; i < message.length; i++) {
    // tslint:disable-next-line: no-bitwise
    code ^= message.readUInt8(i)
  }

  return code
}

function wrapWithCheckCode(payload: Buffer) {
  const checkCode = calculateCheckCode(payload)

  const result = Buffer.alloc(payload.length + 3)
  result.writeUInt8(SOH, 0)
  payload.copy(result, 1, 0)
  result.writeUInt8(checkCode, payload.length + 1)
  result.writeUInt8(TERMINATOR, payload.length + 2)

  return result
}

export function saveSettings(id: number): Buffer {
  const body = Buffer.from([STX, 0x0c, ETX])
  const header = buildHeader(id, MessageType.Command, body.length)

  return wrapWithCheckCode(Buffer.concat([header, body]))
}

export function buildGetCommand(id: number, command: 'SERIAL' | 'MODEL' | 'POWER'): Buffer | null {
  let rawCommand: number
  switch (command) {
    case 'SERIAL':
      rawCommand = 0xc216
      break
    case 'MODEL':
      rawCommand = 0xc217
      break
    case 'POWER':
      rawCommand = 0x01d6
      break
    default:
      return null
  }
  const body = Buffer.from([STX, ...encodeToHexBytes(rawCommand), ETX])
  const header = buildHeader(id, MessageType.Command, body.length)

  return wrapWithCheckCode(Buffer.concat([header, body]))
}

// module.exports.buildSetCommand = function(id, command, data){
//   var encodedCommand;
//   switch(command){
//     case "POWER":
//       var powerMode = linq.from(Commands.POWER_MODES)
//         .firstOrDefault(function(m){ return m.key == data; }, { value: Commands.POWER_MODES['OFF'] }).value;
//       encodedCommand = encodeHex("C203D6") + encodeHex(powerMode);
//     break;
//     default:
//       return null;
//   }

//   var body = STX + encodedCommand + ETX;
//   var primary = buildHeader(id, Type.COMMAND, body.length/2) + body;

//   return SOH + primary + module.exports.calculateCheckCode(primary) + TERMINATOR;
// };
