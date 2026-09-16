/**
 * Build the canonical URL for the current page: origin + pathname, with no query string
 * or hash, so parameterised views (`?timeBucket=`, table sort/paging params, …) all
 * resolve to one indexable URL.
 *
 * @param url Current page URL (`page.url`)
 * @param options.lowercasePath Lowercase the path — for routes keyed by EVM addresses,
 *   which are accepted in any casing but must not be indexed under several casings
 */
export function getCanonicalUrl(url: URL, options: { lowercasePath?: boolean } = {}): string {
	const pathname = options.lowercasePath ? url.pathname.toLowerCase() : url.pathname;
	return `${url.origin}${pathname}`;
}
