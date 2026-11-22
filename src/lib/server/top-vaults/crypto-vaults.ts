import { env } from '$env/dynamic/private';
import { createWarmCache } from '$lib/server/warm-cache';
import { getR2Object, isR2Configured } from '$lib/r2/client';
import { isoDateTime } from '$lib/schemas/utility';
import { normaliseVaultProtocol } from '$lib/top-vaults/helpers';
import { type VaultInfo, vaultInfoSchema } from '$lib/top-vaults/schemas';
import { z } from 'zod';

type CryptoFamily = 'btc' | 'eth';

interface CryptoVaultExport {
	generatedAt: string;
	curators: Map<string, Record<CryptoFamily, VaultInfo[]>>;
}

const DEFAULT_CRYPTO_VAULT_BUCKET = 'vaults-pro-data';

const exportSchema = z.object({ generated_at: isoDateTime, vaults: z.array(z.unknown()) });
const cryptoFieldsSchema = z.object({
	denomination_family: z.enum(['btc', 'eth']),
	curator_slug: z.string().min(1),
	current_total_assets: z.number().nullable(),
	peak_total_assets: z.number().nullable(),
	periodic_metrics_usd: z
		.array(z.object({ exchange_rate_end: z.number().positive(), period_end_at: isoDateTime }).nullable().catch(null))
		.nullish()
});

/** Index the native crypto rows by curator and denomination family. */
export function parseCryptoVaultExport(raw: unknown): CryptoVaultExport {
	const { generated_at: generatedAt, vaults } = exportSchema.parse(raw);
	const curators: CryptoVaultExport['curators'] = new Map();

	for (const row of vaults) {
		const crypto = cryptoFieldsSchema.safeParse(row);
		if (!crypto.success) continue;

		const { denomination_family: family, curator_slug: curator } = crypto.data;
		const latestRate = crypto.data.periodic_metrics_usd
			?.filter((period) => period != null)
			.toSorted((a, b) => b.period_end_at.localeCompare(a.period_end_at))[0];
		const vault = vaultInfoSchema.safeParse({
			...(row as Record<string, unknown>),
			current_nav: crypto.data.current_total_assets,
			peak_nav: crypto.data.peak_total_assets
		});
		if (!vault.success) continue;

		const rate = vault.data.denomination_token_rate;
		const hasTokenUsdRate = rate?.usd_rate != null && rate.usd_rate > 0;
		const vaultWithRate = normaliseVaultProtocol({
			...vault.data,
			denomination_token_rate: {
				coingecko_id: rate?.coingecko_id ?? null,
				usd_rate: hasTokenUsdRate ? rate.usd_rate : (latestRate?.exchange_rate_end ?? null),
				usd_rate_fetched_at: hasTokenUsdRate ? rate.usd_rate_fetched_at : null,
				usd_rate_source: hasTokenUsdRate ? rate.usd_rate_source : latestRate ? 'crypto-vault-export' : null,
				source_currency: family,
				native_rate_currency: family,
				native_rate: rate?.native_rate ?? null,
				native_rate_fetched_at: rate?.native_rate_fetched_at ?? null,
				native_rate_source: rate?.native_rate_source ?? null,
				source_currency_usd_rate: rate?.source_currency_usd_rate ?? null,
				source_currency_usd_rate_fetched_at: rate?.source_currency_usd_rate_fetched_at ?? null,
				source_currency_usd_rate_source: rate?.source_currency_usd_rate_source ?? null
			}
		});
		const groups = curators.get(curator) ?? { btc: [], eth: [] };
		groups[family].push(vaultWithRate);
		curators.set(curator, groups);
	}

	// The exporter uses UTC timestamps without a timezone suffix.
	return { generatedAt: /(?:Z|[+-]\d{2}:\d{2})$/.test(generatedAt) ? generatedAt : `${generatedAt}Z`, curators };
}

async function fetchCryptoVaultExport(fetchFn: Fetch, signal?: AbortSignal): Promise<CryptoVaultExport> {
	const sourceUrl = env.TS_PRIVATE_CRYPTO_VAULT_METADATA_URL;
	if (sourceUrl) {
		const timeout = AbortSignal.timeout(10_000);
		const response = await fetchFn(sourceUrl, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
		if (!response.ok) throw new Error(`Crypto vault export returned ${response.status}`);
		return parseCryptoVaultExport(await response.json());
	}

	const bucket = env.TS_PRIVATE_CRYPTO_VAULT_R2_BUCKET_NAME || DEFAULT_CRYPTO_VAULT_BUCKET;
	const result = await getR2Object('crypto-vault-metadata.json', bucket, signal);
	if (!result?.body) throw new Error('Crypto vault export is unavailable');
	return parseCryptoVaultExport(JSON.parse(await result.body.transformToString()));
}

function isCryptoVaultExportConfigured() {
	return Boolean(
		env.TS_PRIVATE_CRYPTO_VAULT_METADATA_URL || env.TS_PRIVATE_CRYPTO_VAULT_R2_BUCKET_NAME || isR2Configured()
	);
}

/** The optional crypto export, refreshed hourly by the background warmer; a failed refresh keeps the last good copy. */
export const cryptoVaultsCache = createWarmCache<CryptoVaultExport | null>({
	name: 'crypto-vaults',
	load: (_key, fetch, signal) =>
		isCryptoVaultExportConfigured() ? fetchCryptoVaultExport(fetch, signal) : Promise.resolve(null),
	refreshIntervalMs: 60 * 60 * 1000,
	maxSourceAgeMs: 6 * 60 * 60 * 1000,
	sourceTime: (data) => data?.generatedAt
});

/**
 * Share the optional crypto export across curator loads. Returns `null` when the export is
 * not configured, or when it has never loaded and is unavailable now.
 *
 * @param fetchFn SvelteKit fetch
 */
export async function getCachedCryptoVaults(fetchFn: typeof fetch) {
	if (!isCryptoVaultExportConfigured()) return null;
	try {
		return await cryptoVaultsCache.get(fetchFn);
	} catch {
		console.warn('Could not load the crypto vault export');
		return null;
	}
}
