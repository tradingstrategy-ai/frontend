/**
 * "Similar vaults" for a vault detail page: the largest indexable vaults on the same protocol,
 * preferring the same denomination.
 *
 * Vault detail pages otherwise link to only a handful of other vault URLs, so vaults beyond the
 * first page of each hub get few internal links. See `.claude/plans/seo-round-4-vault-rankings.md`,
 * workstream 5.
 */
import {
	getMonthlyReturn,
	getVaultCurrentTvlUsd,
	isBlacklisted,
	isUnknownVaultProtocol,
	isVaultIndexable
} from './helpers';
import type { VaultInfo } from './schemas';

/** A compact row, enough to render a link with its headline figures. */
export type SimilarVault = {
	name: string;
	slug: string;
	apy: number | null;
	tvlUsd: number | null;
};

type SimilarVaultsOptions = {
	/** Maximum number of vaults to return */
	limit?: number;
	/** Apply the denomination USD rate to a candidate (as the detail loader does for the page's vault) */
	withRates?: (vault: VaultInfo) => VaultInfo;
};

/**
 * Pick the vaults to link from a vault detail page.
 *
 * Candidates share the vault's protocol, are not blacklisted and are indexable (linking to a
 * `noindex` page wastes the link). Same-denomination vaults come first, then other vaults on the
 * protocol; each group is ordered by USD TVL. Unknown-protocol vaults get no suggestions.
 *
 * @param vault the vault whose page is being rendered
 * @param vaults all listed vaults
 * @param options limit and rate application
 */
export function getSimilarVaults(
	vault: VaultInfo,
	vaults: VaultInfo[],
	{ limit = 5, withRates = (candidate) => candidate }: SimilarVaultsOptions = {}
): SimilarVault[] {
	if (!vault.protocol_slug || isUnknownVaultProtocol(vault)) return [];

	const candidates = vaults
		.filter(
			(candidate) =>
				candidate.id !== vault.id && candidate.protocol_slug === vault.protocol_slug && !isBlacklisted(candidate)
		)
		.map(withRates)
		.filter((candidate) => isVaultIndexable(candidate))
		.map((candidate) => ({
			sameDenomination: candidate.denomination_slug === vault.denomination_slug,
			row: {
				name: candidate.name,
				slug: candidate.vault_slug,
				apy: getMonthlyReturn(candidate),
				tvlUsd: getVaultCurrentTvlUsd(candidate)
			}
		}));

	return candidates
		.toSorted(
			(a, b) => Number(b.sameDenomination) - Number(a.sameDenomination) || (b.row.tvlUsd ?? -1) - (a.row.tvlUsd ?? -1)
		)
		.slice(0, limit)
		.map(({ row }) => row);
}
