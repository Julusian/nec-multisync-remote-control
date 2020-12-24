export function convertMonitorId(rawId: string): number | undefined {
	if (rawId.length !== 1) {
		return undefined
	} else if (rawId === '*' || (rawId >= '1' && rawId <= '100') || (rawId >= 'A' && rawId <= 'J')) {
		return rawId.charCodeAt(0)
	} else {
		return undefined
	}
}
