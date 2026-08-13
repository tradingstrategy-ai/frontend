import { describe, expect, test } from 'vitest';
import { fetchAndParseGlossary, getGlossaryEntry, getGlossarySlug } from './glossary';

describe('glossary slugs', () => {
	test('normalises source and legacy RSI slugs to the canonical app slug', () => {
		expect(getGlossarySlug('Relative strength index (RSI)')).toBe('relative-strength-index-rsi');
		expect(getGlossarySlug('#term-Relative-strength-index-RSI')).toBe('relative-strength-index-rsi');
		expect(getGlossarySlug('relative-strength-index-(rsi)')).toBe('relative-strength-index-rsi');
	});

	test('resolves legacy parenthesised slugs from the glossary map', () => {
		const glossary = {
			'relative-strength-index-rsi': {
				name: 'Relative strength index (RSI)',
				slug: 'relative-strength-index-rsi',
				description: 'RSI description',
				html: '<p>RSI description.</p>'
			}
		};

		expect(getGlossaryEntry(glossary, 'relative-strength-index-(rsi)')?.slug).toBe('relative-strength-index-rsi');
	});

	test('rewrites Sphinx term links to canonical app slugs', async () => {
		const source = `
			<dl class="glossary">
				<dt id="term-Relative-strength-index-RSI">Relative strength index (RSI)<a href="#term-Relative-strength-index-RSI">#</a></dt>
				<dd><p>See <a class="reference internal" href="#term-Stochastic-RSI-indicator">Stochastic RSI</a>.</p></dd>
				<dt id="term-Stochastic-RSI-indicator">Stochastic RSI indicator<a href="#term-Stochastic-RSI-indicator">#</a></dt>
				<dd><p>Uses RSI.</p></dd>
			</dl>
		`;
		const fetch = async () => new Response(source);

		const glossary = await fetchAndParseGlossary(fetch as Fetch);

		expect(glossary['relative-strength-index-rsi'].html).toContain('href="stochastic-rsi-indicator"');
	});
});
