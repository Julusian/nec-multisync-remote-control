export enum MessageType {
	Command = 0x41,
	CommandReply = 0x42,
	Get = 0x43,
	GetReply = 0x44,
	Set = 0x45,
	SetReply = 0x46,
}

export enum PowerModes {
	On = 0x0001,
	Standby = 0x0002,
	Suspend = 0x0003,
	Off = 0x0004,
}

export const MONITOR_ID_ALL = '*'
export type MonitorId = '*' | string
