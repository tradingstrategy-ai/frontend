import { logoTypes } from '$lib/helpers/assets';

const logoPaths = logoTypes.map((type) => type + 's');

export function match(param) {
	// @ts-ignore
	return logoPaths.includes(param);
}
