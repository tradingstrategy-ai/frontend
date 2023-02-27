import type { PageLoad } from './$types';

export const load = (() => {
	return { skipFooter: true };
}) satisfies PageLoad;
