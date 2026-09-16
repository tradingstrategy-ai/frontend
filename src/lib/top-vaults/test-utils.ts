import { getChain } from '$lib/helpers/chain';
import { slugify } from '$lib/helpers/slugify';
import { type PeriodMetrics, type VaultInfo, vaultInfoSchema } from './schemas';

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
	const chain_id = merged.chain_id ?? getChain(merged.chain)?.id;

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

/**
 * Build a complete `PeriodMetrics` fixture for one period.
 *
 * @param period period label as the backend emits it, e.g. `1M`, `6m`, `lifetime`
 * @param grossReturn absolute gross return for the period
 * @param grossCagr annualised gross return for the period
 * @param netReturn net return, used for both the absolute and annualised net values
 */
export function createPeriodMetrics(
	period: string,
	grossReturn: number,
	grossCagr: number,
	netReturn: number | null
): PeriodMetrics {
	return {
		period,
		error_reason: null,
		period_start_at: '2026-01-01T00:00:00',
		period_end_at: '2026-02-01T00:00:00',
		share_price_start: 1,
		share_price_end: 1 + grossReturn,
		raw_samples: 31,
		samples_start_at: '2026-01-01T00:00:00',
		samples_end_at: '2026-02-01T00:00:00',
		daily_samples: 31,
		returns_gross: grossReturn,
		returns_net: netReturn,
		cagr_gross: grossCagr,
		cagr_net: netReturn,
		volatility: null,
		sharpe: null,
		max_drawdown: null,
		tvl_start: null,
		tvl_end: null,
		tvl_low: null,
		tvl_high: null,
		ranking_overall: null,
		ranking_chain: null,
		ranking_protocol: null
	};
}
