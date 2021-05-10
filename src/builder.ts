import { ETX, HEADER_RESERVED, SENDER_ID, SOH, STX, TERMINATOR } from './constants'
import { MessageType } from './enums'
import { encodeToHexBytes, flatten } from './util'

export function buildMessage(id: number, type: MessageType, commandId: number[], value?: number[]): Buffer {
	const body = Buffer.from([
		STX,
		...flatten(commandId.map((c) => encodeToHexBytes(c))),
		...flatten((value || []).map((c) => encodeToHexBytes(c))),
		ETX,
	])

	const header = buildHeader(id, type, body.length)
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
		...encodeToHexBytes(length),
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

// export function saveSettings(id: number): Buffer {
//   const body = Buffer.from([STX, 0x0c, ETX])
//   const header = buildHeader(id, MessageType.Command, body.length)

//   return wrapWithCheckCode(Buffer.concat([header, body]))
// }
