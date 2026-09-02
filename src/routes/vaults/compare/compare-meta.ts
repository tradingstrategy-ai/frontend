import { TRADING_STRATEGY_SOCIAL_IMAGE_PATH, getVaultSocialCardImageUrl } from '$lib/social-card/helpers';
import type { VaultInfo } from '$lib/top-vaults/schemas';

export interface VaultCompareMeta {
	title: string;
	description: string;
	image?: string;
	imageAlt?: string;
	selectedVaultIds: string[];
}

export const DEFAULT_COMPARE_TITLE = 'Compare and find best DeFi vault yield';
export const DEFAULT_COMPARE_DESCRIPTION = 'Analyse more than 5000 vaults';

/**
 * Build a human-readable comparison title from URL-selected vault names.
 *
 * @param vaults Vaults selected by the URL, already ordered by query parameter order
 * @param requestedVaultCount Number of vault IDs supplied in the URL
 */
export function getVaultCompareTitle(vaults: Pick<VaultInfo, 'name'>[], requestedVaultCount: number): string {
	if (vaults.length === 0 || requestedVaultCount === 0) return DEFAULT_COMPARE_TITLE;

	const [first, second, third, fourth] = vaults;

	if (requestedVaultCount === 1 || vaults.length === 1) return `Compare ${first.name} and other vaults`;
	if (requestedVaultCount > 4) return `Compare ${first.name} and others`;
	if (vaults.length === 2) return `Compare vault ${first.name} and ${second.name}`;
	if (vaults.length === 3) return `Compare vault ${first.name}, ${second.name} and ${third.name}`;

	return `Compare vault ${first.name}, ${second.name}, ${third.name} and ${fourth.name}`;
}

/**
 * Resolve selected vaults from repeated `vault` URL parameters.
 *
 * @param searchParams Page query parameters
 * @param allVaults Available vault dataset
 */
export function getSelectedCompareVaults(searchParams: URLSearchParams, allVaults: VaultInfo[]): VaultInfo[] {
	const vaultsById = new Map(allVaults.map((vault) => [vault.id, vault]));
	return searchParams
		.getAll('vault')
		.filter(Boolean)
		.flatMap((id) => vaultsById.get(id) ?? []);
}

/**
 * Build metadata used by title, Open Graph, Twitter/X and structured data tags.
 *
 * @param searchParams Page query parameters
 * @param allVaults Available vault dataset
 */
export function getVaultCompareMeta(searchParams: URLSearchParams, allVaults: VaultInfo[]): VaultCompareMeta {
	const requestedVaultCount = searchParams.getAll('vault').filter(Boolean).length;
	const selectedVaults = getSelectedCompareVaults(searchParams, allVaults);
	const title = getVaultCompareTitle(selectedVaults, requestedVaultCount);
	const firstVault = selectedVaults[0];

	return {
		title,
		description: DEFAULT_COMPARE_DESCRIPTION,
		selectedVaultIds: selectedVaults.map(({ id }) => id),
		image: firstVault
			? getVaultSocialCardImageUrl(firstVault, TRADING_STRATEGY_SOCIAL_IMAGE_PATH)
			: TRADING_STRATEGY_SOCIAL_IMAGE_PATH,
		imageAlt: firstVault ? `${firstVault.name} preview image` : 'Trading Strategy vault comparison preview image'
	};
}
