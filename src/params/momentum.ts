import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return ['daily-up', 'daily-down'].includes(param);
}) satisfies ParamMatcher;
