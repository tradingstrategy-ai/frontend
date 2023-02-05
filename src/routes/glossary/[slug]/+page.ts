/**
 * Load the server-side glossary dictionary and extract one term out of it.
 *
 * The glossary data is cached on CloudFlare is frequently accessed.
 */
import type { PageLoad } from './$types';
import {error} from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export const load: PageLoad = async ({ params, fetch }) => {
	const resp = await fetch('/glossary/api');
	const glossary = await resp.json();

	const term = glossary[params.slug];

	if(!term) {
		throw error(404, `Term not found: ${params.slug}`);
	}

	return {
		term
	};
};
