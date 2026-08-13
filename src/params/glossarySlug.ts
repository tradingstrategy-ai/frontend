export function match(param) {
	return /^[A-Za-z0-9_.()~%-]+$/.test(param);
}
