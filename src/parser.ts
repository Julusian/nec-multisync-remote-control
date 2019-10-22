import { calculateCheckCode, SOH, SENDER_ID } from './builder'
import { MessageType, PowerModes } from './enums'
import { bufferReadHex, bufferReadString } from './util'

// var OperationType = {
//   SET: '00',
//   MOMENTARY: '01'
// }

export interface ParsedHeaderInfo {
  deviceId: number
  type: number
  bodyLength: number
  totalLength: number
}

export function parseMessageHeader(message: Buffer): ParsedHeaderInfo | undefined {
  if (message.readUInt8(0) !== SOH || message.readUInt8(2) !== SENDER_ID) {
    return undefined
  }

  const bodyLength = bufferReadHex(message, 5, 1)
  const type = message.readUInt8(4) as MessageType
  if (!MessageType[type]) {
    return undefined
  }

  return {
    deviceId: message.readUInt8(2),
    type,
    bodyLength,
    totalLength: bodyLength + 9
  }
}

export function parseMessage(message: Buffer) {
  const checksumByte = message.readUInt8(message.length - 2)
  const calculatedChecksum = calculateCheckCode(message.slice(1, message.length - 2))
  if (checksumByte !== calculatedChecksum) {
    throw new Error(`Message checksum failed. Got: ${calculatedChecksum} Expected ${checksumByte}`)
  }

  const headerProps = parseHeader(message)
  console.log('header', headerProps)

  const body = message.slice(7, message.length - 2)
  if (body.length !== headerProps.length) {
    throw new Error(`Message body length incorrect. Got: ${body.length} Expected ${headerProps.length}`)
  }

  switch (headerProps.type) {
    case MessageType.GetReply:
    case MessageType.SetReply:
      return parseGetSetReply(body)
    case MessageType.CommandReply:
      return parseCommandReply(body)
    default:
      throw new Error(`Message received of unsupported type: ${MessageType[headerProps.type]}`)
  }
}

function parseHeader(message: Buffer) {
  // in hex: 01 30 _ID_ 30 _TYPE_ _LEN_ _LEN2_
  const type = message.readUInt8(4) as MessageType
  if (!MessageType[type]) {
    throw new Error(`Message received with unknown type: ${type}`)
  }

  return {
    type,
    length: bufferReadHex(message, 5, 1)
  }
}

function parseGetSetReply(_body: Buffer) {
  //   var rawResult = message.substr(1 * 2, 2 * 2) // chars 1+2
  //   var rawPage = message.substr(3 * 2, 2 * 2) // chars 3+4
  //   var rawCode = message.substr(5 * 2, 2 * 2) // chars 5+6
  //   var rawType = message.substr(7 * 2, 2 * 2) // chars 7+8
  //   var rawMaxValue = message.substr(9 * 2, 4 * 2) // chars 9-12
  //   var rawCurrentValue = message.substr(13 * 2, 4 * 2) // chars 13+14
  //   var commandResult = decodeHex(rawResult)
  //   var page = decodeHex(rawPage)
  //   var code = decodeHex(rawCode)
  //   var type = decodeHex(rawType)
  //   var maxValue = decodeHex(rawMaxValue)
  //   var currentValue = decodeHex(rawCurrentValue)
  //   //check result was good
  //   if (commandResult != '00') return (result.err = 'UNSUPPORTED_OPERATION')
  //   var commandType = Commands.fromCodes(page, code)
  //   if (commandType === null) unknownCommand()
  //   result.command = commandType.key
  //   result.operationType = linq.from(OperationType).firstOrDefault(function(t) {
  //     return t.value == type
  //   })
  //   if (result.operationType === null) return (result.err = 'UNKNOWN_OPERATION_TYPE')
  //   result.operationType = result.operationType.key
  //   result.maxValue = maxValue
  //   result.value = currentValue
  //   if (commandType.value.type == 'range') result.value = parseInt(result.value, 16)
}

function unknownCommand(group: number, command: number): never {
  throw new Error(`Unknown command - ${group.toString(16)}-${command.toString(16)}`)
}

function parseCommandReply(body: Buffer) {
  let group = bufferReadHex(body, 1, 1)
  console.log(group)
  if (group === 0x02) {
    body = body.slice(4)
    group = bufferReadHex(body, 1, 1)
    console.log('trim group - why?')
  }
  if (group === 0x01) {
    throw new Error('Unsupported operation')
  } else if (group === 0x00) {
    body = body.slice(4)
  }
  console.log('final group', group)

  const command = bufferReadHex(body, 3, 1)
  //   console.log(body, command)
  switch (group) {
    case 0xd6:
      return parseGetPower(body)
    case 0xa1:
      console.log('SELF DIAG')
      break
    case 0xc0:
      switch (command) {
        default:
          unknownCommand(group, command)
      }
      break
    case 0xc1:
      switch (command) {
        default:
          unknownCommand(group, command)
      }
      break
    case 0xc2:
      switch (command) {
        case 0x03:
          return parseSetPower(body)
        default:
          unknownCommand(group, command)
      }
      break
    case 0xc3:
      switch (command) {
        case 0x16:
          return parseStringResponse(body, 'SERIAL')
        case 0x17:
          return parseStringResponse(body, 'MODEL')
        default:
          unknownCommand(group, command)
      }
      break
  }
  unknownCommand(group, command)
  return null
}

function parseGetPower(body: Buffer) {
  const state = bufferReadHex(body, 9, 2)

  if (PowerModes[state] === undefined) {
    throw new Error(`Unknown power state 0x${state.toString(16)}`)
  }

  // TODO - typings
  return {
    command: 'POWER',
    state: state as PowerModes
  }
}

function parseSetPower(body: Buffer) {
  const state = bufferReadHex(body, 7, 2)

  if (PowerModes[state] === undefined) {
    throw new Error(`Unknown power state 0x${state.toString(16)}`)
  }

  // TODO - typings
  return {
    command: 'POWER',
    state: state as PowerModes
  }
}

function parseStringResponse(body: Buffer, command: string) {
  const strLength = body.length / 2 - 5 - 1
  const decodedStr = bufferReadString(body, 5, strLength).replace(/\0/g, '')

  // TODO - typings
  return {
    command,
    serial: decodedStr
  }
}
