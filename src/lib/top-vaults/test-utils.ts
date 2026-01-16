import { getChain } from '$lib/helpers/chain';
import { slugify } from '$lib/helpers/slugify';
import { type VaultInfo, vaultInfoSchema } from './schemas';

type NullableVaultKeysRaw = {
	[K in keyof VaultInfo]: null extends VaultInfo[K] ? K : never;
}[keyof VaultInfo];

type NullableVaultKeys = Exclude<NullableVaultKeysRaw, undefined>;

type NullableVaultProps = Pick<VaultInfo, NullableVaultKeys>;

const vaultRiskMap = {
	Negligible: 1,
	Minimal: 10,
	Low: 20,
	High: 30,
	Severe: 40,
	Dangerous: 50,
	Blacklisted: 999
} as const;

type VaultRiskOptions = keyof typeof vaultRiskMap;
type VaultRiskProp = { risk: VaultRiskOptions };

export type TestVaultProps = Partial<Omit<VaultInfo, 'name'>> & Partial<VaultRiskProp>;

function getVaultNullableDefaults(): NullableVaultProps {
	const shape = vaultInfoSchema.shape;
	const result: Partial<NullableVaultProps> = {};

	for (const key in shape) {
		const propType = shape[key as keyof VaultInfo].type;
		if (['nullable', 'optional'].includes(propType)) {
			result[key as keyof NullableVaultProps] = null;
		}
	}

	return result as NullableVaultProps;
}

const defaultVaultProps = {
	protocol: 'Trading Strategy',
	chain: 'ethereum' as const,
	denomination: 'USDC',
	stablecoinish: true,
	start_date: '2025-01-01T00:00:00',
	end_date: '2026-01-01T00:00:00',
	last_updated_at: '2026-01-01T00:00:00',
	last_updated_block: 12345,
	features: [],
	flags: [],
	period_results: []
} as const;

export function createTestVault(name: string, props: TestVaultProps = {}): VaultInfo {
	const merged = { ...defaultVaultProps, ...props, name };
	const address = merged.address ?? `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`;
	const chain_id = getChain(merged.chain)?.id;

	return vaultInfoSchema.parse({
		...getVaultNullableDefaults(),
		...merged,
		address,
		chain_id,
		id: `${chain_id}-${address}`,
		vault_slug: slugify(merged.name),
		share_token: slugify(merged.name).toUpperCase(),
		protocol_slug: slugify(merged.protocol),
		normalised_denomination: merged.denomination,
		denomination_slug: slugify(merged.denomination),
		risk_numeric: props.risk ? vaultRiskMap[props.risk] : null
	});
}
