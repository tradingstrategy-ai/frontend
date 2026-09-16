/**
 * Import the glossary from the documentation HTML.
 *
 * - Scrape the HTML and form the glossary dict.
 * - See: https://github.com/taoqf/node-html-parser
 */
import { type HTMLElement, parse } from 'node-html-parser';
import { error } from '@sveltejs/kit';
import { slugify } from '$lib/helpers/slugify';
import assert from 'node:assert';
import { dev } from '$app/environment';
import swrCache from '$lib/swrCache';

const glossaryBaseUrl = 'https://tradingstrategy.ai/docs/glossary.html';

export type GlossaryEntry = {
	name: string;
	slug: string;
	description: string;
	html: string;
};

export type GlossaryMap = Record<string, GlossaryEntry>;

/** The subset of a glossary entry the index page needs to render a link. */
export type GlossaryIndexEntry = Pick<GlossaryEntry, 'slug' | 'name'>;

/**
 * Convert Sphinx term IDs or legacy glossary URL segments to canonical app slugs.
 *
 * @param source Glossary source ID, URL slug, or URL fragment
 */
export function getGlossarySlug(source: string) {
	let value = source;

	try {
		value = decodeURIComponent(value);
	} catch {
		// Use the raw value when a malformed URL segment cannot be decoded.
	}

	return slugify(value.replace(/^#?term-/i, ''));
}

/**
 * Find a glossary entry by canonical slug or a legacy/source slug variant.
 *
 * @param glossary Glossary entry map
 * @param slug URL slug to resolve
 */
export function getGlossaryEntry(glossary: GlossaryMap, slug: string) {
	return glossary[slug] ?? glossary[getGlossarySlug(slug)];
}

/**
 * Could not scrape glossary entries correctly
 */
export class GlossaryParseError extends Error {
	// https://stackoverflow.com/a/41429145/315168
	constructor(msg: string) {
		super(msg);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Rewrite internal links to relative page refs
 */
function rewriteInternalLinks(node: HTMLElement) {
	node.querySelectorAll('a[href^="#term-"]').forEach((a) => {
		const href = a.getAttribute('href')!;
		const newHref = getGlossarySlug(href);
		a.setAttribute('href', newHref);
	});
}

/**
 * Extract first sentence from string
 */
function getFirstSentence(str: string) {
	return str.split('.', 1)[0];
}

/**
 * Get text from first text node of <dt> (ignore nested <a>#</a> tags)
 */
function getTermText(dt: HTMLElement) {
	return dt.firstChild?.text ?? '';
}

/**
 * Get sibling <dd> element of <dt>
 */
function getDefinitionElem(dt: HTMLElement) {
	const dd = dt.nextElementSibling;
	return dd?.tagName === 'DD' ? dd : undefined;
}

/**
 * Read the glossary HTML and parse out terms.
 *
 * Transform links.
 *
 * @param fetch - SvelteKit's fetch function
 *
 * @throws GlossaryParseError
 *	In the case the source Sphinx HTML is badly formatted due
 *	to broken manual edits.
 *
 */
export async function fetchAndParseGlossary(fetch: Fetch) {
	const resp = await fetch(glossaryBaseUrl);
	const source = await resp.text();

	// Find all dt elements that are immediate children of the dl.glossary
	const dts = parse(source).querySelectorAll('dl.glossary > dt');

	return dts.reduce(
		(glossary, dt) => {
			const name = getTermText(dt);
			assert(
				/\w/.test(name), // should have at least one word character
				new GlossaryParseError(
					`Could not read glossary term "${name}"; previous term: ${Object.values(glossary).at(-1)?.name}`
				)
			);

			const slug = getGlossarySlug(name);
			assert(!glossary[slug], new GlossaryParseError(`Duplicate glossary slug: ${slug}`));

			const dd = getDefinitionElem(dt);
			assert(dd, new GlossaryParseError(`Sibling <dd> for <dt> "${name}" not found`));

			rewriteInternalLinks(dd);
			const html = dd.innerHTML;
			const description = getFirstSentence(dd.text);

			glossary[slug] = { name, slug, html, description };
			return glossary;
		},
		{} as Record<string, GlossaryEntry>
	);
}

// Create a SWR cache for strategies with 5 minute TTL in production (1 min in dev)
const cacheTimeSeconds = dev ? 1 : 5 * 60;
export const getCachedGlossary = swrCache(fetchAndParseGlossary, cacheTimeSeconds);

/**
 * Load the cached glossary for a server `load` function.
 *
 * Wraps `getCachedGlossary` with the shared error handling (a scraping failure becomes a
 * 503 rather than a 500) and sets the cache headers that let the browser and CDN avoid
 * re-fetching the page while the server-side cache is fresh.
 *
 * Callers must return only the entries they render: SvelteKit serialises all `load` data
 * into the page HTML, and the full glossary is over 1 MB.
 *
 * @param fetch SvelteKit's `fetch`
 * @param setHeaders SvelteKit's `setHeaders`
 */
export async function loadGlossaryForPage(fetch: Fetch, setHeaders: (headers: Record<string, string>) => void) {
	let glossary: GlossaryMap;

	try {
		glossary = await getCachedGlossary(fetch);
	} catch (e) {
		if (e instanceof GlossaryParseError) {
			error(503, {
				message: 'Service Unavailable',
				stack: e.stack?.split('\n')
			});
		}
		throw e;
	}

	setHeaders({
		'cache-control': `public, max-age=${getCachedGlossary.ttl}`,
		age: getCachedGlossary.getAge(fetch).toFixed(0)
	});

	return glossary;
}
