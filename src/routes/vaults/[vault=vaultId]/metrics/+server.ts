import type { UTCTimestamp } from 'lightweight-charts';
import { error, isHttpError, json } from '@sveltejs/kit';
import { queryVaultPriceRows } from '$lib/server/top-vaults/vault-price-series';

/** The price parquet changes at most hourly */
const METRICS_CACHE_TTL_SECONDS = 60 * 60;

/** Bounds memory: one response is 250–700 KB of JSON for a long history, and there are ~5,000 vaults */
const METRICS_CACHE_MAX_ENTRIES = 100;

type VaultMetricsPayload = {
	price: [UTCTimestamp, number][];
	tvl: [UTCTimestamp, number][];
	utilisation: [UTCTimestamp, number][];
};

const cache = new Map<string, { payload: VaultMetricsPayload; expires: number }>();
const inFlight = new Map<string, Promise<VaultMetricsPayload>>();

async function loadVaultMetrics(vaultId: string): Promise<VaultMetricsPayload> {
	let rows;
	try {
		rows = await queryVaultPriceRows([vaultId], { includeVaultMetrics: true });
	} catch (e) {
		// Pass the 503 of a missed data deadline through unchanged
		if (isHttpError(e)) throw e;

		console.error(`Error loading price data for vault <${vaultId}>`);
		const { stack } = e as Error;
		error(500, {
			message: `Error loading vault data for vault id <${vaultId}>`,
			stack: stack ? [stack] : undefined
		});
	}

	const payload: VaultMetricsPayload = { price: [], tvl: [], utilisation: [] };
	for (const { timestamp, sharePrice, totalAssets, utilisation } of rows) {
		const ts = timestamp as UTCTimestamp;
		payload.price.push([ts, sharePrice]);
		payload.tvl.push([ts, totalAssets as number]);
		if (utilisation != null) payload.utilisation.push([ts, utilisation]);
	}
	return payload;
}

/** Serve from the in-memory cache, sharing one query between concurrent requests for a vault. */
async function getVaultMetrics(vaultId: string): Promise<VaultMetricsPayload> {
	const cached = cache.get(vaultId);
	if (cached && Date.now() < cached.expires) return cached.payload;

	let pending = inFlight.get(vaultId);
	if (!pending) {
		pending = loadVaultMetrics(vaultId)
			.then((payload) => {
				cache.delete(vaultId);
				cache.set(vaultId, { payload, expires: Date.now() + METRICS_CACHE_TTL_SECONDS * 1000 });
				// Map keeps insertion order, so the first key is the oldest entry
				if (cache.size > METRICS_CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value!);
				return payload;
			})
			.finally(() => inFlight.delete(vaultId));
		inFlight.set(vaultId, pending);
	}
	return pending;
}

export async function GET({ params }) {
	const payload = await getVaultMetrics(params.vault);

	return json(payload, {
		headers: { 'cache-control': `public, max-age=${METRICS_CACHE_TTL_SECONDS}` }
	});
}
