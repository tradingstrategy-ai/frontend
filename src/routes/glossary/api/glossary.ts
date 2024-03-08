/**
 * Import the glossary from the documentation HTML.
 *
 * - Scrape the HTML and form the glossary dict.
 * - See: https://github.com/taoqf/node-html-parser
 */

import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';
import type { GlossaryMap } from './types';

const glossaryBaseUrl = 'https://tradingstrategy.ai/docs/glossary.html';

/**
 * Could not scrape glossary entries correctly
 */
export class GlossaryDataReadFailed extends Error {
	// https://stackoverflow.com/a/41429145/315168
	constructor(msg: string) {
		super(msg);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, GlossaryDataReadFailed.prototype);
	}
}

function rewriteInternalLinks(node: HTMLElement) {
	node.querySelectorAll('a[href^="#term-"]').forEach((a) => {
		const href = a.getAttribute('href')!;
		const newHref = href.replace('#term-', '').toLowerCase();
		a.setAttribute('href', newHref);
	});
}

function getFirstSentence(str: string): string {
	var t = str.split('.', 1)[0];
	return t;
}

/**
 * Read the glossary HTML and parse out terms.
 *
 * Transform links.
 *
 * @param fetch - SvelteKit's fetch function
 *
 * @throws GlossaryDataReadFailed
 *	In the case the source Sphinx HTML is badly formatted due
 *	to broken manual edits.
 *
 */
export async function fetchAndParseGlossary(fetch: Fetch): Promise<GlossaryMap> {
	const resp = await fetch(glossaryBaseUrl);
	const source = await resp.text();

	const root = parse(source);
	const glossary: GlossaryMap = {};

	const dts = root.querySelectorAll('dt');

	let previousTerm = null;

	// Go through every element on glosssary.html source
	for (const dt of dts) {
		// Get the first text node (ignore nested <a>#</a>)
		const name = dt.firstChild?.text!;
		const slug = name.toLowerCase().replaceAll(' ', '-');

		// We have dt and dd elements, the term is in dt followed by body in dd
		// TODO: use better method for guaranteeing `dd` element
		const dd = dt.nextElementSibling as unknown as HTMLElement;

		rewriteInternalLinks(dd);

		const shortDescription = getFirstSentence(dd.text);

		if (!name || !slug) {
			throw new GlossaryDataReadFailed(`Could not read glossary term: ${name}, previous term is ${previousTerm}`);
		}

		if (slug in glossary) {
			throw new GlossaryDataReadFailed(`Duplicate glossary slug: ${slug}`);
		}

		const html = dd.innerHTML;
		glossary[slug] = { html, name, slug, shortDescription };

		previousTerm = name;
	}

	return glossary;
}
