import { describe, expect, it } from 'vitest';
import { organizationSchema, serializeSchema, sitelinksSearchBox } from './google-meta';

function parse(script: string) {
	const json = script.match(/<script type="application\/ld\+json">([\s\S]*)<\/script>/)?.[1];
	expect(json).toBeDefined();
	return JSON.parse(json!);
}

describe('google-meta serialisers', () => {
	it('wraps metadata in a JSON-LD script tag', () => {
		expect(serializeSchema({ a: 1 })).toBe('<script type="application/ld+json">{"a":1}</script>');
	});

	it('declares the Organization with a stable id and an indexable logo', () => {
		const org = parse(organizationSchema());
		expect(org['@type']).toBe('Organization');
		expect(org['@id']).toBe('https://tradingstrategy.ai/#organization');
		expect(org.logo).toBe('https://tradingstrategy.ai/brand-mark-512x512.png');
		expect(org.sameAs).toContain('https://github.com/tradingstrategy-ai');
	});

	it('declares the site search action', () => {
		const site = parse(sitelinksSearchBox());
		expect(site['@type']).toBe('WebSite');
		expect(site.potentialAction.target.urlTemplate).toContain('{search_term_string}');
	});
});
