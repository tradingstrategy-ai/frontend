export function match(param): param is 'daily-up' | 'daily-down' {
	return ['daily-up', 'daily-down'].includes(param);
}
