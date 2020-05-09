export function encodeToHexBytes(value: number, padLength?: number) {
  let str = value.toString(16)
  if (str.length % 2 !== 0) {
    str = '0' + str
  }

  if (padLength) {
    str = str.padStart(padLength * 2, '0')
  }
  return str.split('').map((b) => b.charCodeAt(0))
}

export function bufferWriteHex(buffer: Buffer, value: number, offset: number, length: number) {
  let encoded = encodeToHexBytes(value, length)
  if (encoded.length > length * 2) {
    encoded = encoded.slice(length * 2 - encoded.length)
  }

  for (let i = 0; i < length * 2; i++) {
    buffer.writeUInt8(encoded[i], offset + i)
  }
}

export function bufferReadHex(buffer: Buffer, offset: number, length: number): number {
  let str = '0x'
  for (let i = 0; i < length * 2; i++) {
    str += String.fromCharCode(buffer.readUInt8(offset + i))
  }
  return parseInt(str, 16)
}

export function bufferReadString(buffer: Buffer, offset: number, length: number): string {
  let res = ''
  let str = ''
  for (let i = 0; i < length * 2; i++) {
    str += String.fromCharCode(buffer.readUInt8(offset + i))
    if (str.length === 2) {
      res += String.fromCharCode(parseInt(str, 16))
      str = ''
    }
  }
  return res
}

export function assertUnreachable(_never: never): never {
  throw new Error("Didn't expect to get here")
}

export function literal<T>(val: T): T {
  return val
}
