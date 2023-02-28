import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return ['open', 'closed', 'frozen'].includes(param);
}) satisfies ParamMatcher;
