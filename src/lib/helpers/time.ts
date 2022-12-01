/**
 * Get the UNIX epoch timestamp as UTC.
 */
export function getUnixTimestampUTC() {
	// https://stackoverflow.com/a/29295210/315168
	return ~~(+new Date() / 1000);
}
