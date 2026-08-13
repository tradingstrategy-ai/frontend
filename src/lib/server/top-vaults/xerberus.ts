import type { VaultInfo, XerberusVault } from '$lib/top-vaults/schemas';

/**
 * Gets the protocol-level Xerberus assessment embedded in the vault dataset.
 *
 * The data pipeline attaches the same protocol assessment to each covered
 * vault, so this deliberately reads from the already-cached vault JSON rather
 * than requesting data from Xerberus at page-load time.
 *
 * @param vaults - Vault records from the top-vaults JSON
 * @param protocolSlug - Trading Strategy protocol slug to resolve
 */
export function getXerberusProtocolAssessment(vaults: VaultInfo[], protocolSlug: string): XerberusVault | null {
	return (
		vaults.find((vault) => vault.xerberus?.entity_type === 'protocol' && vault.xerberus.protocol_slug === protocolSlug)
			?.xerberus ?? null
	);
}
