import { env } from '$env/dynamic/private';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { dirname } from 'node:path';
import { VAULT_PRICES_PARQUET, VAULT_PRICES_PARQUET_PATH } from './constants';

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

function getConfiguredUpstreamUrl(): string | null {
	const url = env.TS_PRIVATE_VAULT_PRICES_PARQUET_URL?.trim();
	return url ? url : null;
}

async function ensureVaultPricesParquetInner({
	localPath = VAULT_PRICES_PARQUET_PATH,
	upstreamUrl = getConfiguredUpstreamUrl(),
	checkIntervalMs = ONE_HOUR_MS,
	fetchFn = fetch,
	now = () => new Date()
}: EnsureVaultPricesParquetOptions = {}): Promise<string> {
	const localStat = await stat(localPath).catch(() => null);
	const currentTime = now();

	if (!localStat) {
		if (!upstreamUrl) {
			throw new Error(
				`Vault prices parquet is missing at ${localPath} and TS_PRIVATE_VAULT_PRICES_PARQUET_URL is not configured`
			);
		}

		const metadata = await downloadRemoteFile(fetchFn, upstreamUrl, localPath, currentTime);
		await writeCachedMetadata(localPath, metadata);
		return localPath;
	}

	if (currentTime.getTime() - localStat.mtimeMs < checkIntervalMs || !upstreamUrl) {
		return localPath;
	}

	try {
		const remoteMetadata = await headRemoteFile(fetchFn, upstreamUrl);
		const cachedMetadata = await readCachedMetadata(localPath);

		if (hasRemoteFileChanged(remoteMetadata, cachedMetadata)) {
			const downloadedMetadata = await downloadRemoteFile(fetchFn, upstreamUrl, localPath, currentTime);
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
 * Resolve the local vault prices Parquet file, refreshing it from Cloudflare
 * when the cache check interval has expired.
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
