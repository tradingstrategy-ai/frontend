import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return ['open', 'closed', 'frozen'].includes(param);
};
