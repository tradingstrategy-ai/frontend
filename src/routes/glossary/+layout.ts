/**
 * Data loader for all /glossary routes
 */
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch }) => {
	const resp = await fetch('/glossary/api');

	if (!resp.ok) {
		console.log(resp.text());
		throw new Error(`Could not load glossary. See console log for details.`);
	}

	return {
		glossary: resp.json()
	};
}) satisfies LayoutLoad;
