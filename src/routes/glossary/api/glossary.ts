/**
 * Import the glossary from the documentation HTML.
 *
 * - Scrape the HTML and form the glossary dict.
 *
 * - See Cheerio API https://cheerio.js.org/classes/Cheerio.html
 */

import * as cheerio from 'cheerio';
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

/**
 * Mutate glossary dd node and fix any links in it back to glossary itself.
 *
 * See example https://stackoverflow.com/a/60011663/315168
 *
 * @param dd
 */
function fixGlossaryElemHtml($, dd, baseUrl: string) {
	const $dd = $(dd);

	$dd.find('a').each(function () {
		const $this = $(this);
		let href = $this.attr('href');
		// Glossary.html in-page link
		if (href.startsWith('#')) {
			href = href.replace('#term-', baseUrl).toLowerCase();
		}
		$this.attr('href', href);
	});
	return $dd.html();
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
 * @param baseUrl
 *  The base URL for the glossary for the rewritten links
 *
 *  @throws GlossaryDataReadFailed
 *  	In the case the source Sphinx HTML is badly formatted due
 *  	to broken manual edits.
 *
 *
 */
export async function fetchAndParseGlossary(baseUrl: string): Promise<GlossaryMap> {
	const resp = await fetch(glossaryBaseUrl);
	const source = await resp.text();
	const $ = cheerio.load(source);

	const glossary: GlossaryMap = {};

	const dts = $('dt');

	let previousTerm = null;

	// Go through every element on glosssary.html source
	for (const dt of dts) {
		let $dt = $(dt);

		// There is embedded <a>#</a> anchor in dt we need to remove
		$dt.find('a').remove();

		// We have dt and dd elements, the term is in dt followed by body in dd
		const name = $dt.text();
		const slug = name.toLowerCase().replaceAll(' ', '-');
		const html = fixGlossaryElemHtml($, dt.next, baseUrl);

		const bodyText = $(html).text();
		const shortDescription = getFirstSentence(bodyText);

		if (!name || !slug) {
			throw new GlossaryDataReadFailed(`Could not read glossary term: ${name}, previous term is ${previousTerm}`);
		}

		if (slug in glossary) {
			throw new GlossaryDataReadFailed(`Duplicate glossary slug: ${slug}`);
		}

		glossary[slug] = { html, name, slug, shortDescription };

		previousTerm = name;
	}

	return glossary;
}
