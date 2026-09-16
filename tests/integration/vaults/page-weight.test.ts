import { expect, test } from '@playwright/test';

/**
 * Regression guard for vault listing page weight.
 *
 * Listing pages serialise their first batch of vault rows into the HTML twice — as table
 * markup and as SvelteKit page data — so the document size is driven by the batch size
 * (`INITIAL_VAULT_LISTING_LIMIT`) and the row shape (`toVaultListingRow`). Both have
 * regressed silently before; these assertions make the next such change fail loudly.
 *
 * The budget is measured against the mock dataset served by the integration test
 * server; live vault records are larger, so keep the headroom modest.
 */

/** Uncompressed HTML byte budget for the first page of a listing. */
const LISTING_DOCUMENT_BUDGET_BYTES = 900 * 1024;

/** Rows rendered server-side before the continuation endpoint takes over. */
const INITIAL_ROWS = 75;

/**
 * Fields that exist on the full vault record but must never reach the browser through a
 * listing page. Each appears as a JSON key in the serialised page data if the row
 * projection is bypassed.
 */
const DETAIL_ONLY_FIELDS = [
	'share_token_address',
	'trading_strategy_link',
	'short_description',
	'first_updated_at',
	'lifetime_samples',
	// period metrics that only the vault detail page renders
	'share_price_start',
	'raw_samples',
	'ranking_overall'
];

for (const path of ['/vaults', '/vaults/protocols/apex']) {
	test(`${path} stays within the listing page weight budget`, async ({ page }) => {
		const response = await page.request.get(path);
		expect(response.status()).toBe(200);
		const html = await response.text();

		expect(html.length, `document bytes for ${path}`).toBeLessThan(LISTING_DOCUMENT_BUDGET_BYTES);

		const rows = html.match(/<tr[^>]*class="[^"]*\btargetable\b/g) ?? [];
		expect(rows.length, 'server-rendered listing rows').toBe(INITIAL_ROWS);

		for (const field of DETAIL_ONLY_FIELDS) {
			expect(html, `detail-only field "${field}" serialised into listing page`).not.toContain(`"${field}":`);
		}
	});
}
