/**
 * Import the glossary from the documentation HTML.
 *
 * - Scrape the HTML and form the glossary dict.
 * - See: https://github.com/taoqf/node-html-parser
 */

import type { GlossaryMap } from './types';
import { type HTMLElement, parse } from 'node-html-parser';
import { slugify } from '$lib/helpers/slugify';
import assert from 'node:assert';

const glossaryBaseUrl = 'https://tradingstrategy.ai/docs/glossary.html';

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
		const newHref = href.replace('#term-', '').toLowerCase();
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
export async function fetchAndParseGlossary(fetch: Fetch): Promise<GlossaryMap> {
	const resp = await fetch(glossaryBaseUrl);
	const source = await resp.text();

	const root = parse(source);
	const glossary: GlossaryMap = {};

	// Find all dt elements that are immediate children of the dl.glossary
	const dts = root.querySelectorAll('dl.glossary > dt');

	// Go through every element on glosssary.html source
	for (const dt of dts) {
		const name = getTermText(dt);
		assert(
			/\w/.test(name), // should have at least one word character
			new GlossaryParseError(
				`Could not read glossary term "${name}"; previous term: ${Object.values(glossary).at(-1)?.name}`
			)
		);

		const slug = slugify(name);
		assert(!glossary[slug], new GlossaryParseError(`Duplicate glossary slug: ${slug}`));

		const dd = getDefinitionElem(dt);
		assert(dd, new GlossaryParseError(`Sibling <dd> for <dt> "${name}" not found`));

		rewriteInternalLinks(dd);

		const html = dd.innerHTML;
		const shortDescription = getFirstSentence(dd.text);

		glossary[slug] = { name, slug, html, shortDescription };
	}

	return glossary;
}
