export function match(param): param is `${number}` {
	return /^\d+$/.test(param);
}
