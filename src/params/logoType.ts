import { logoTypes } from '$lib/helpers/assets';

const logoPaths = logoTypes.map((type) => type + 's');

export function match(param: string) {
	return logoPaths.includes(param);
}
