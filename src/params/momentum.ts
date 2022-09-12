import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return ['daily-up', 'daily-down'].includes(param);
};
