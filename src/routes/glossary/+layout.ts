/**
 * Data loader for all /glossary routes
 */
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const resp = await fetch('/glossary/api');

	return {
		glossary: resp.json()
	};
};
