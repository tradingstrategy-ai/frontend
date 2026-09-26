/**
 * Search-facing wording for the vault hub pages (`/vaults`, chain, protocol, stablecoin and
 * curator hubs).
 *
 * Titles and descriptions use the phrases people search — "<Protocol> vaults", "APY", "best
 * <coin> yield" — rather than our own category name ("stablecoin vaults"). See
 * `.claude/plans/seo-round-4-vault-rankings.md`, "Search vocabulary", for where the phrases
 * come from.
 */
import { formatDollar, formatPercent, isNumber } from '$lib/helpers/formatters';
import { SITE_NAME, TITLE_MAX_LENGTH } from '$lib/helpers/seo';

export type HubDescriptionInput = {
	/** What is being compared, in search wording: `Morpho vaults`, `USDC vaults`, `DeFi vaults` */
	subject: string;
	/** Number of vaults in the default filtered listing */
	count?: number | null;
	/** Summed TVL of the listing, in USD */
	totalTvl?: number | null;
	/** TVL-weighted one-month annualised return of the listing */
	apy?: number | null;
	/** When the vault dataset was generated */
	updatedAt?: Date | string | null;
	/** Entity metadata (protocol, stablecoin or curator short description) appended after the data */
	about?: string | null;
};

/**
 * Format a dataset timestamp as `25 Sep 2026` (UTC, UK order).
 *
 * @param value dataset `generated_at`
 */
export function formatDataDate(value: Date | string | null | undefined): string | undefined {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;
	return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Data-led meta description for a vault hub.
 *
 * `Compare 214 Morpho vaults by APY, TVL and risk: $1.2B TVL, 6.1% average APY (TVL-weighted,
 * 30 days). Data updated 25 Sep 2026.` followed by the entity's own description. Figures that are
 * missing are left out rather than shown as placeholders. The count describes the default
 * filtered listing, hence "listed". `SocialCardMetaTags` cuts the result to the display length.
 *
 * @param input subject in search wording, listing figures and optional entity description
 */
export function getHubDescription({ subject, count, totalTvl, apy, updatedAt, about }: HubDescriptionInput): string {
	const lead = isNumber(count) && count > 0 ? `Compare ${count} listed ${subject}` : `Compare ${subject}`;

	const figures: string[] = [];
	if (isNumber(totalTvl) && totalTvl > 0) figures.push(`${formatDollar(totalTvl, 1, 1)} TVL`);
	if (isNumber(apy)) figures.push(`${formatPercent(apy, 1)} average APY (TVL-weighted, 30 days)`);

	const sentences = [`${lead} by APY, TVL and risk${figures.length ? `: ${figures.join(', ')}` : ''}.`];

	const date = formatDataDate(updatedAt);
	if (date) sentences.push(`Data updated ${date}.`);

	const aboutText = about?.trim();
	if (aboutText) sentences.push(aboutText);

	return sentences.join(' ');
}

/**
 * `ItemList` entries for a hub's JSON-LD: the server-rendered rows, in the order the table shows
 * them. Only rows the page actually renders are listed, so the markup matches the visible list.
 *
 * @param vaults the listing rows rendered on the server (first batch)
 * @param origin site origin for absolute URLs, e.g. `https://tradingstrategy.ai`
 */
export function getItemListElements(vaults: { name: string; vault_slug: string }[], origin: string) {
	return vaults.map((vault, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		name: vault.name,
		url: new URL(`/vaults/${vault.vault_slug}`, origin).href
	}));
}

/**
 * `titleParts` for a hub: the heading plus the first qualifier that fits `TITLE_MAX_LENGTH` with
 * the brand suffix, or the heading alone. `getPageTitle()` would otherwise drop the qualifier
 * entirely as soon as the preferred one is a few characters too long for a long name.
 *
 * @param heading entity phrase in search wording, e.g. `Hyperliquid vaults`
 * @param qualifiers qualifiers from most to least descriptive, e.g. `['APY, TVL and curators', 'APY and TVL']`
 */
export function getHubTitleParts(heading: string, qualifiers: string[]): string[] {
	const qualifier = qualifiers.find(
		(candidate) => `${heading} | ${candidate} | ${SITE_NAME}`.length <= TITLE_MAX_LENGTH
	);
	return qualifier ? [heading, qualifier] : [heading];
}
