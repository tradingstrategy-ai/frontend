import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const STATS_CACHE_PATH = 'data/pricing-stats.json';
const CACHE_TTL_MS = 7 * 7 * 24 * 60 * 60 * 1000; // 7 weeks

interface PricingStats {
	chains: number;
	protocols: number;
	stablecoinVaults: number;
	cachedAt: number;
}

async function readDiskCache(): Promise<Omit<PricingStats, 'cachedAt'> | null> {
	try {
		const text = await readFile(STATS_CACHE_PATH, 'utf8');
		const stats: PricingStats = JSON.parse(text);
		if (Date.now() < stats.cachedAt + CACHE_TTL_MS) {
			const { cachedAt: _, ...rest } = stats;
			return rest;
		}
		return null;
	} catch {
		return null;
	}
}

async function writeDiskCache(stats: Omit<PricingStats, 'cachedAt'>): Promise<void> {
	try {
		await mkdir(dirname(STATS_CACHE_PATH), { recursive: true });
		await writeFile(STATS_CACHE_PATH, JSON.stringify({ ...stats, cachedAt: Date.now() }));
	} catch {
		// Non-critical — page still renders without disk cache
	}
}

export async function load({ fetch }) {
	const cached = await readDiskCache();
	if (cached) return { stats: cached };

	try {
		const topVaults = await getCachedTopVaults(fetch);
		const chains = new Set(topVaults.vaults.map((v) => v.chain)).size;
		const protocols = new Set(topVaults.vaults.map((v) => v.protocol)).size;
		const stablecoinVaults = topVaults.vaults.filter((v) => v.stablecoinish).length;
		const stats = { chains, protocols, stablecoinVaults };
		await writeDiskCache(stats);
		return { stats };
	} catch {
		return { stats: null };
	}
}
