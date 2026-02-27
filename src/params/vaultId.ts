/** Match vault ID format: `${chainId}-0x${address}` (e.g., `1-0x00000000efe883b3304aff71eacf72dbc3e1b577`) */
export function match(param: string) {
	return /^\d+-0x[0-9a-f]+$/i.test(param);
}
