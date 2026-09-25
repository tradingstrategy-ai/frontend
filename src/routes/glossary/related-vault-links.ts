/**
 * Links from glossary terms to the vault pages that show the data behind them.
 *
 * Search demand for Hyperliquid and HLP vaults lands on `/glossary/hyperliquid-provider-vault`
 * (position ~13) rather than on the vault pages, so the term pages that rank pass visitors — and
 * link weight — on to the matching vault page. Anchors use the phrases people search. See
 * `.claude/plans/seo-round-4-vault-rankings.md`, workstreams 5 and 8.
 */

export type RelatedVaultLink = { href: string; label: string };

const RELATED_VAULT_LINKS: Record<string, RelatedVaultLink[]> = {
	'hyperliquid-provider-vault': [
		{ href: '/vaults/hyperliquidity-provider-hlp', label: 'HLP vault APY and returns' },
		{ href: '/vaults/protocols/hyperliquid', label: 'Best Hyperliquid vaults' }
	],
	vault: [{ href: '/vaults', label: 'Best DeFi vaults by APY and risk' }],
	'erc-4626': [{ href: '/vaults', label: 'Best DeFi vaults by APY and risk' }],
	'erc-7540': [{ href: '/vaults', label: 'Best DeFi vaults by APY and risk' }],
	apy: [{ href: '/vaults', label: 'DeFi vaults ranked by APY' }],
	stablecoin: [{ href: '/vaults/stablecoins', label: 'Compare stablecoin yields' }],
	'total-value-locked-tvl': [{ href: '/vaults', label: 'DeFi vaults by TVL and APY' }]
};

/**
 * Vault pages to link from a glossary term, or an empty list.
 *
 * @param slug canonical glossary slug
 */
export function getRelatedVaultLinks(slug: string): RelatedVaultLink[] {
	return RELATED_VAULT_LINKS[slug] ?? [];
}
