/**
 * Data loader for all /glossary routes
 */
import type { LayoutLoad } from './$types';
import {publicApiError} from "$lib/helpers/publicApiError";

export const load: LayoutLoad = async ({ fetch }) => {
	const resp = await fetch('/glossary/api');

	if (!resp.ok) {
		console.log(resp.text());
		throw new Error(`Could not load glossary. See console log for details.`);
	}

	return {
		glossary: resp.json()
	};
};
