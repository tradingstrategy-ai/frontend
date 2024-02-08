/**
 * Data loader for all /glossary routes
 */
import { publicApiError } from '$lib/helpers/public-api.js';

export async function load({ fetch }) {
	const resp = await fetch('/glossary/api');

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		glossary: await resp.json()
	};
}
