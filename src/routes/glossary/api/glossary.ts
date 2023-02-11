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
 * Mutate glossary dd node and fix any links in it back to glossary itself.
 *
 * See example https://stackoverflow.com/a/60011663/315168
 *
 * @param dd
 */
function fixGlossaryElemHtml($, dd, baseUrl: string) {
	const $dd = $(dd);
	$dd.find('a').replaceWith(function () {
		const $this = $(this);

		let href = $this.attr('href');

		// Glossary.html in-page link
		if (href.startsWith('#')) {
			href = href.replace('#term-', baseUrl).toLowerCase();
		}
		return $this.attr('href', href);
	});

	return $dd.html();
}

// https://stackoverflow.com/a/196991/315168
function toTitleCase(str: string): string {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
	});
}

function getFirstSentence(str: string): string {
	var t = str.split('. ', 1)[0];
	return t;
}

/**
 * Read the glossary HTML and parse out terms.
 *
 * Transform links.
 *
 * @param baseUrl
 *  The base URL for the glossary for the rewritten links
 */
export async function fetchAndParseGlossary(baseUrl: string): Promise<GlossaryMap> {
	const resp = await fetch(glossaryBaseUrl);
	const source = await resp.text();
	const $ = cheerio.load(source);

	const glossary: GlossaryMap = {};

	const dts = $('dt');

	for (const dt of dts) {
		let $dt = $(dt);
		// There is embedded <a>#</a> anchor in dt we need to remove
		$dt.find('a').remove();

		const text = $dt.text();
		const name = toTitleCase(text);
		const shortDescription = getFirstSentence(text);
		const slug = name.toLowerCase().replaceAll(' ', '-');
		const html = fixGlossaryElemHtml($, dt.next, baseUrl);
		glossary[slug] = { html, name, slug, shortDescription };
	}

	return glossary;
}
