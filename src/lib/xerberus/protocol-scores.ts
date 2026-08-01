import { z } from 'zod';
import { slugify } from '$lib/helpers/slugify';

const XERBERUS_APP_URL = 'https://app.xerberus.io';
const XERBERUS_CACHE_TTL_MS = 60 * 60 * 1000;

const XERBERUS_PROTOCOL_ALIASES = new Map([
	['silo-finance', 'silo-v2'],
	['usdai', 'usd-ai']
]);

const registryResponseSchema = z.object({
	data: z.object({
		protocols: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				has_scorecard: z.boolean().catch(false)
			})
		)
	})
});

const scoreResponseSchema = z.object({
	data: z.object({
		protocols: z.record(
			z.string(),
			z
				.object({
					composite_score: z.number().min(0).max(1).nullable().optional()
				})
				.passthrough()
		)
	})
});

export interface XerberusProtocolScore {
	id: string;
	name: string;
	score: number;
	url: string;
}

export interface XerberusProtocolScoreIndex {
	byId: Map<string, XerberusProtocolScore>;
	byLookupKey: Map<string, XerberusProtocolScore>;
}

let cachedScoreIndex: { expiresAt: number; promise: Promise<XerberusProtocolScoreIndex> } | null = null;

function stripVersionSuffix(value: string) {
	return value.replace(/-v\d+$/i, '');
}

function addLookupKey(index: XerberusProtocolScoreIndex, key: string, score: XerberusProtocolScore) {
	if (!key || index.byLookupKey.has(key)) return;
	index.byLookupKey.set(key, score);
}

function addScore(index: XerberusProtocolScoreIndex, score: XerberusProtocolScore) {
	index.byId.set(score.id, score);
	addLookupKey(index, score.id, score);
	addLookupKey(index, stripVersionSuffix(score.id), score);

	const slugifiedName = slugify(score.name);
	addLookupKey(index, slugifiedName, score);
	addLookupKey(index, stripVersionSuffix(slugifiedName), score);
}

async function fetchJson(fetchFn: typeof fetch, pathname: string) {
	const response = await fetchFn(`${XERBERUS_APP_URL}${pathname}`, {
		headers: { accept: 'application/json' }
	});
	if (!response.ok) {
		throw new Error(`Xerberus API request failed (${response.status})`);
	}
	return response.json();
}

async function fetchXerberusProtocolScoreIndex(fetchFn: typeof fetch): Promise<XerberusProtocolScoreIndex> {
	const [registryJson, scoreJson] = await Promise.all([
		fetchJson(fetchFn, '/api/dendrogram/registry?classes=Protocol&fields=list'),
		fetchJson(fetchFn, '/api/dendrogram/scores?classes=Protocol')
	]);

	const registry = registryResponseSchema.parse(registryJson);
	const scores = scoreResponseSchema.parse(scoreJson);
	const index: XerberusProtocolScoreIndex = {
		byId: new Map(),
		byLookupKey: new Map()
	};

	for (const protocol of registry.data.protocols) {
		const score = scores.data.protocols[protocol.id]?.composite_score;
		if (!protocol.has_scorecard || score == null) continue;

		addScore(index, {
			id: protocol.id,
			name: protocol.name,
			score,
			url: `${XERBERUS_APP_URL}/protocol/dendrogram/${protocol.id}`
		});
	}

	return index;
}

export async function getCachedXerberusProtocolScoreIndex(fetchFn: typeof fetch) {
	const now = Date.now();
	if (cachedScoreIndex && cachedScoreIndex.expiresAt > now) return cachedScoreIndex.promise;

	const promise = fetchXerberusProtocolScoreIndex(fetchFn);
	cachedScoreIndex = {
		expiresAt: now + XERBERUS_CACHE_TTL_MS,
		promise
	};

	try {
		return await promise;
	} catch (error) {
		if (cachedScoreIndex.promise === promise) cachedScoreIndex = null;
		throw error;
	}
}

export function resolveXerberusProtocolScore(
	index: XerberusProtocolScoreIndex,
	protocol: { slug: string; name: string }
): XerberusProtocolScore | null {
	const alias = XERBERUS_PROTOCOL_ALIASES.get(protocol.slug);
	const nameSlug = slugify(protocol.name);
	const candidates = [
		protocol.slug,
		alias,
		stripVersionSuffix(protocol.slug),
		nameSlug,
		stripVersionSuffix(nameSlug)
	].filter((candidate): candidate is string => Boolean(candidate));

	for (const candidate of candidates) {
		const score = index.byLookupKey.get(candidate);
		if (score) return score;
	}

	return null;
}
