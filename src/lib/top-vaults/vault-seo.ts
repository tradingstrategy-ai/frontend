/**
 * Search-result title and generated description for vault detail pages.
 *
 * People search "<vault> vault", "<vault> <protocol> vault" and "<vault> apy"; the title names
 * the protocol and chain so it matches those queries, dropping detail until it fits the display
 * length. See `.claude/plans/seo-round-4-vault-rankings.md`, workstream 2.
 */
import { getChainDisplayName } from '$lib/helpers/chain';
import { formatDollar, formatPercent, isNumber } from '$lib/helpers/formatters';
import { SITE_NAME, TITLE_MAX_LENGTH } from '$lib/helpers/seo';
import {
	getMonthlyReturn,
	getVaultAssetType,
	getVaultCurrentTvlUsd,
	getVaultProtocolDisplayName,
	isUnknownVaultProtocol
} from './helpers';
import type { VaultInfo } from './schemas';

type VaultSeoInput = Parameters<typeof getVaultCurrentTvlUsd>[0] &
	Pick<
		VaultInfo,
		| 'name'
		| 'protocol'
		| 'protocol_slug'
		| 'chain_id'
		| 'flags'
		| 'features'
		| 'risk'
		| 'one_month_cagr'
		| 'one_month_cagr_net'
	>;

/**
 * `titleParts` for a vault detail page: the vault name, then the most descriptive qualifier
 * that fits `TITLE_MAX_LENGTH` with the brand suffix — `<Protocol> vault on <Chain>`,
 * `<Protocol> vault`, `DeFi vault`. When even the shortest does not fit, only the name is kept.
 *
 * @param vault vault identity (name, protocol, chain, flags)
 */
export function getVaultTitleParts(vault: VaultSeoInput): string[] {
	const name = vault.name.trim();
	const assetType = getVaultAssetType(vault);
	const chain = getChainDisplayName(vault.chain_id);
	const protocol = isUnknownVaultProtocol(vault) ? undefined : getVaultProtocolDisplayName(vault);

	const qualifiers = [
		protocol && `${protocol} ${assetType} on ${chain}`,
		protocol && `${protocol} ${assetType}`,
		`DeFi ${assetType}`
	].filter((qualifier): qualifier is string => Boolean(qualifier));

	const fits = qualifiers.find((qualifier) => `${name} | ${qualifier} | ${SITE_NAME}`.length <= TITLE_MAX_LENGTH);
	return fits ? [name, fits] : [name];
}

/**
 * Description for a vault that has no `short_description` of its own.
 *
 * `<Name> is a Morpho vault on Ethereum: APY 7.4% (annualised, last 30 days), TVL $12.3M,
 * risk: Low.` APY is the annualised one-month return (net when available) and TVL is in USD;
 * either is left out when unknown rather than shown in the wrong unit.
 *
 * @param vault vault with its denomination rate applied (`withVaultDenominationTokenRate`)
 */
export function getGeneratedVaultDescription(vault: VaultSeoInput): string {
	const assetType = getVaultAssetType(vault);
	const chain = getChainDisplayName(vault.chain_id);
	const identity = isUnknownVaultProtocol(vault)
		? `${vault.name} is a DeFi ${assetType} on ${chain}`
		: `${vault.name} is a ${getVaultProtocolDisplayName(vault)} ${assetType} on ${chain}`;

	const figures: string[] = [];
	const apy = getMonthlyReturn(vault);
	if (isNumber(apy)) figures.push(`APY ${formatPercent(apy, 1)} (annualised, last 30 days)`);
	const tvl = getVaultCurrentTvlUsd(vault);
	if (isNumber(tvl)) figures.push(`TVL ${formatDollar(tvl, 1, 1)}`);
	if (vault.risk) figures.push(`risk: ${vault.risk}`);

	return figures.length ? `${identity}: ${figures.join(', ')}.` : `${identity}.`;
}
