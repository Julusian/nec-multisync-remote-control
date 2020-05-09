import { calculateCheckCode } from './builder'
import { SENDER_ID, SOH } from './constants'
import { MessageType } from './enums'
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
    totalLength: bodyLength + 9,
  }
}

export interface ParsedResponse {
  page: number
  opcode: number
  value: string | number
}

export function parseMessage(commandId: number[], message: Buffer): string | number {
  const checksumByte = message.readUInt8(message.length - 2)
  const calculatedChecksum = calculateCheckCode(message.slice(1, message.length - 2))
  if (checksumByte !== calculatedChecksum) {
    throw new Error(`Message checksum failed. Got: ${calculatedChecksum} Expected ${checksumByte}`)
  }

  const headerProps = parseHeader(message)
  // console.log('header', headerProps)

  const body = message.slice(7, message.length - 2)
  if (body.length !== headerProps.length) {
    throw new Error(`Message body length incorrect. Got: ${body.length} Expected ${headerProps.length}`)
  }

  switch (headerProps.type) {
    case MessageType.GetReply:
    case MessageType.SetReply:
      const res = parseGetSetReply(body)
      if (commandId[0] !== res.page || commandId[1] !== res.opcode) {
        throw new Error('wrong command response')
      }

      return res.value
    case MessageType.CommandReply:
      return parseCommandReply(commandId, body)
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
    length: bufferReadHex(message, 5, 1),
  }
}

function parseGetSetReply(body: Buffer) {
  const result = bufferReadHex(body, 1, 1)
  const page = bufferReadHex(body, 3, 1)
  const opcode = bufferReadHex(body, 5, 1)
  // const type = bufferReadHex(body, 7, 1)
  // const maxValue = bufferReadHex(body, 9, 2)
  const currentValue = bufferReadHex(body, 13, 2)

  // check result was good
  if (result !== 0x00) {
    throw new Error('Unsupported operation')
  }
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
  // TODO - if range, decode hex?
  return {
    page,
    opcode,
    value: currentValue,
  }
}

/**
 * Parsing command responses is a lot more complex, as there doesnt appear to be much uniformity in them.
 */
function parseCommandReply(commandId: number[], body: Buffer): string | number {
  // console.log('command response', body, commandId)

  switch (commandId[0]) {
    case 0xd6: {
      // Power get response
      const page = bufferReadHex(body, 5, 1)
      if (page !== commandId[0]) {
        throw new Error('wrong command response')
      }

      const result = bufferReadHex(body, 3, 1)
      if (result !== 0x00) {
        // page is actually result
        throw new Error('Unsupported operation')
      }

      return bufferReadHex(body, 13, 2)
    }
    case 0xc2: {
      // Power set response
      const result = bufferReadHex(body, 1, 1)
      if (result !== 0x00) {
        // page is actually result
        throw new Error('Unsupported operation')
      }

      const actualPage = bufferReadHex(body, 3, 1)
      const opcode = bufferReadHex(body, 5, 1)
      if (actualPage !== commandId[0] || opcode !== commandId[1]) {
        throw new Error('wrong command response')
      }

      return bufferReadHex(body, 9, 2)
    }
    case 0xc3: {
      const page = bufferReadHex(body, 1, 1)
      const opcode = bufferReadHex(body, 3, 1)
      // console.log(page, opcode, commandId)
      if (page !== commandId[0] || opcode !== commandId[1]) {
        throw new Error('wrong command response')
      }

      const strLength = body.length / 2 - 5 - 1
      const decodedStr = bufferReadString(body, 5, strLength).replace(/\0/g, '')

      return decodedStr
    }
    default:
      throw new Error('Unknown command')
  }
}
