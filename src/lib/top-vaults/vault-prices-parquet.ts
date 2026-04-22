import { env } from '$env/dynamic/private';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { once } from 'node:events';
import { dirname } from 'node:path';
import { VAULT_PRICES_PARQUET, VAULT_PRICES_PARQUET_PATH } from './constants';
import { getR2Object, headR2Object, isR2Configured } from '$lib/r2/client';

const ONE_HOUR_MS = 60 * 60 * 1000;
const HEAD_TIMEOUT_MS = 20_000;
const DOWNLOAD_TIMEOUT_MS = 5 * 60 * 1000;

type RemoteFileMetadata = {
	etag: string | null;
	lastModified: string | null;
	contentLength: number | null;
};

type EnsureVaultPricesParquetOptions = {
	localPath?: string;
	upstreamUrl?: string | null;
	checkIntervalMs?: number;
	fetchFn?: typeof fetch;
	now?: () => Date;
};

const refreshInFlight = new Map<string, Promise<string>>();

function getMetadataPath(localPath: string): string {
	return `${localPath}.cache.json`;
}

function parseContentLength(value: string | null): number | null {
	if (!value) return null;

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : null;
}

function getRemoteMetadataFromHeaders(headers: Headers): RemoteFileMetadata {
	return {
		etag: headers.get('etag'),
		lastModified: headers.get('last-modified'),
		contentLength: parseContentLength(headers.get('content-length'))
	};
}

async function readCachedMetadata(localPath: string): Promise<RemoteFileMetadata | null> {
	try {
		const raw = await readFile(getMetadataPath(localPath), 'utf8');
		const parsed = JSON.parse(raw) as Partial<RemoteFileMetadata>;

		return {
			etag: typeof parsed.etag === 'string' ? parsed.etag : null,
			lastModified: typeof parsed.lastModified === 'string' ? parsed.lastModified : null,
			contentLength: typeof parsed.contentLength === 'number' ? parsed.contentLength : null
		};
	} catch {
		return null;
	}
}

async function writeCachedMetadata(localPath: string, metadata: RemoteFileMetadata): Promise<void> {
	await writeFile(getMetadataPath(localPath), JSON.stringify(metadata));
}

function hasRemoteFileChanged(remote: RemoteFileMetadata, cached: RemoteFileMetadata | null): boolean {
	if (!cached) return true;

	if (remote.etag && cached.etag) return remote.etag !== cached.etag;

	if (remote.lastModified && cached.lastModified && remote.contentLength !== null && cached.contentLength !== null) {
		return remote.lastModified !== cached.lastModified || remote.contentLength !== cached.contentLength;
	}

	if (remote.lastModified && cached.lastModified) return remote.lastModified !== cached.lastModified;
	if (remote.contentLength !== null && cached.contentLength !== null)
		return remote.contentLength !== cached.contentLength;

	return true;
}

async function touchFile(path: string, now: Date): Promise<void> {
	await utimes(path, now, now);
}

// --- URL-based remote access ---

async function headRemoteFile(fetchFn: typeof fetch, upstreamUrl: string): Promise<RemoteFileMetadata> {
	const response = await fetchFn(upstreamUrl, {
		method: 'HEAD',
		signal: AbortSignal.timeout(HEAD_TIMEOUT_MS)
	});

	if (!response.ok) {
		throw new Error(`Vault prices HEAD failed with status ${response.status}`);
	}

	return getRemoteMetadataFromHeaders(response.headers);
}

async function downloadRemoteFile(
	fetchFn: typeof fetch,
	upstreamUrl: string,
	localPath: string,
	now: Date
): Promise<RemoteFileMetadata> {
	const response = await fetchFn(upstreamUrl, {
		signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
	});

	if (!response.ok || !response.body) {
		throw new Error(`Vault prices download failed with status ${response.status}`);
	}

	await mkdir(dirname(localPath), { recursive: true });

	const tempPath = `${localPath}.${process.pid}.${Date.now()}.tmp`;
	const writer = createWriteStream(tempPath);

	try {
		const reader = response.body.getReader();

		while (true) {
			const { done, value } = await reader.read();

			if (done) break;
			if (!value || value.byteLength === 0) continue;

			if (!writer.write(value)) {
				await once(writer, 'drain');
			}
		}

		writer.end();
		await once(writer, 'finish');

		await rename(tempPath, localPath);
		await touchFile(localPath, now);
		return getRemoteMetadataFromHeaders(response.headers);
	} catch (error) {
		writer.destroy();
		await rm(tempPath, { force: true });
		throw error;
	}
}

// --- R2-based remote access ---

function r2MetadataToRemoteFileMetadata(meta: {
	contentLength: number | null;
	lastModified: Date | null;
}): RemoteFileMetadata {
	return {
		etag: null,
		lastModified: meta.lastModified?.toUTCString() ?? null,
		contentLength: meta.contentLength
	};
}

async function headR2File(): Promise<RemoteFileMetadata> {
	const meta = await headR2Object(VAULT_PRICES_PARQUET);
	if (!meta) throw new Error('R2 HEAD returned null');
	return r2MetadataToRemoteFileMetadata(meta);
}

async function downloadR2File(localPath: string, now: Date): Promise<RemoteFileMetadata> {
	const result = await getR2Object(VAULT_PRICES_PARQUET);
	if (!result?.body) throw new Error('R2 GET returned null or empty body');

	await mkdir(dirname(localPath), { recursive: true });

	const tempPath = `${localPath}.${process.pid}.${Date.now()}.tmp`;

	try {
		// AWS SDK body is a SdkStream that extends Readable
		const readable = result.body as unknown as Readable;
		const writer = createWriteStream(tempPath);
		await pipeline(readable, writer);

		await rename(tempPath, localPath);
		await touchFile(localPath, now);
		return r2MetadataToRemoteFileMetadata(result);
	} catch (error) {
		await rm(tempPath, { force: true });
		throw error;
	}
}

// --- Source resolution ---

/** Determine which remote source to use: R2 (preferred) or direct URL (fallback). */
type RemoteSource = { kind: 'r2' } | { kind: 'url'; url: string; fetchFn: typeof fetch } | null;

function getConfiguredUpstreamUrl(): string | null {
	const url = env.TS_PRIVATE_VAULT_PRICES_PARQUET_URL?.trim();
	return url ? url : null;
}

function resolveRemoteSource(upstreamUrl: string | null, fetchFn: typeof fetch): RemoteSource {
	// Explicit URL takes precedence (also used by tests to inject a mock URL)
	if (upstreamUrl) return { kind: 'url', url: upstreamUrl, fetchFn };
	if (isR2Configured()) return { kind: 'r2' };
	return null;
}

async function headRemote(source: RemoteSource & object): Promise<RemoteFileMetadata> {
	if (source.kind === 'r2') return headR2File();
	return headRemoteFile(source.fetchFn, source.url);
}

async function downloadRemote(
	source: RemoteSource & object,
	localPath: string,
	now: Date
): Promise<RemoteFileMetadata> {
	if (source.kind === 'r2') return downloadR2File(localPath, now);
	return downloadRemoteFile(source.fetchFn, source.url, localPath, now);
}

// --- Main logic ---

async function ensureVaultPricesParquetInner({
	localPath = VAULT_PRICES_PARQUET_PATH,
	upstreamUrl = getConfiguredUpstreamUrl(),
	checkIntervalMs = ONE_HOUR_MS,
	fetchFn = fetch,
	now = () => new Date()
}: EnsureVaultPricesParquetOptions = {}): Promise<string> {
	const localStat = await stat(localPath).catch(() => null);
	const currentTime = now();
	const source = resolveRemoteSource(upstreamUrl, fetchFn);

	if (!localStat) {
		if (!source) {
			throw new Error(
				`Vault prices parquet is missing at ${localPath} and neither R2 nor TS_PRIVATE_VAULT_PRICES_PARQUET_URL is configured`
			);
		}

		const metadata = await downloadRemote(source, localPath, currentTime);
		await writeCachedMetadata(localPath, metadata);
		return localPath;
	}

	if (currentTime.getTime() - localStat.mtimeMs < checkIntervalMs || !source) {
		return localPath;
	}

	try {
		const remoteMetadata = await headRemote(source);
		const cachedMetadata = await readCachedMetadata(localPath);

		if (hasRemoteFileChanged(remoteMetadata, cachedMetadata)) {
			const downloadedMetadata = await downloadRemote(source, localPath, currentTime);
			await writeCachedMetadata(localPath, downloadedMetadata);
		} else {
			await touchFile(localPath, currentTime);
		}
	} catch (error) {
		console.warn(`Failed to refresh ${VAULT_PRICES_PARQUET} cache`, error);
	}

	return localPath;
}

/**
 * Resolve the local vault prices Parquet file, refreshing it from R2 (preferred)
 * or a direct URL when the cache check interval has expired.
 */
export async function ensureVaultPricesParquet(options: EnsureVaultPricesParquetOptions = {}): Promise<string> {
	const localPath = options.localPath ?? VAULT_PRICES_PARQUET_PATH;
	const existingRefresh = refreshInFlight.get(localPath);

	if (existingRefresh) return existingRefresh;

	const refresh = ensureVaultPricesParquetInner(options).finally(() => {
		refreshInFlight.delete(localPath);
	});

	refreshInFlight.set(localPath, refresh);
	return refresh;
}
