import { mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ensureVaultPricesParquet } from './vault-prices-parquet';

const ONE_HOUR_MS = 60 * 60 * 1000;
const REMOTE_URL = 'https://vault-prices.example/cleaned-vault-prices-1h.parquet';

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), 'vault-prices-cache-'));
	tempDirs.push(dir);
	return dir;
}

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('ensureVaultPricesParquet', () => {
	it('returns the existing local file without checking upstream while the timer is still fresh', async () => {
		const dir = await makeTempDir();
		const localPath = join(dir, 'cleaned-vault-prices-1h.parquet');
		const now = new Date('2026-04-10T12:00:00.000Z');
		const freshTime = new Date(now.getTime() - 5 * 60 * 1000);

		await writeFile(localPath, 'local-data');
		await utimes(localPath, freshTime, freshTime);

		const fetchFn = vi.fn<typeof fetch>();

		const result = await ensureVaultPricesParquet({
			localPath,
			upstreamUrl: REMOTE_URL,
			fetchFn,
			now: () => now
		});

		expect(result).toBe(localPath);
		expect(fetchFn).not.toHaveBeenCalled();
	});

	it('touches the local file when the remote file is unchanged', async () => {
		const dir = await makeTempDir();
		const localPath = join(dir, 'cleaned-vault-prices-1h.parquet');
		const metadataPath = `${localPath}.cache.json`;
		const oldTime = new Date('2026-04-10T09:00:00.000Z');
		const now = new Date(oldTime.getTime() + ONE_HOUR_MS + 5_000);

		await writeFile(localPath, 'local-data');
		await writeFile(
			metadataPath,
			JSON.stringify({
				etag: '"same-etag"',
				lastModified: 'Thu, 10 Apr 2026 08:00:00 GMT',
				contentLength: 10
			})
		);
		await utimes(localPath, oldTime, oldTime);

		const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
			new Response(null, {
				status: 200,
				headers: {
					etag: '"same-etag"',
					'last-modified': 'Thu, 10 Apr 2026 08:00:00 GMT',
					'content-length': '10'
				}
			})
		);

		await ensureVaultPricesParquet({
			localPath,
			upstreamUrl: REMOTE_URL,
			fetchFn,
			now: () => now
		});

		const fileStat = await stat(localPath);
		expect(fetchFn).toHaveBeenCalledTimes(1);
		expect(fetchFn).toHaveBeenCalledWith(REMOTE_URL, expect.objectContaining({ method: 'HEAD' }));
		expect(fileStat.mtimeMs).toBe(now.getTime());
		expect(await readFile(localPath, 'utf8')).toBe('local-data');
	});

	it('downloads a fresh copy when the remote file has changed', async () => {
		const dir = await makeTempDir();
		const localPath = join(dir, 'cleaned-vault-prices-1h.parquet');
		const metadataPath = `${localPath}.cache.json`;
		const oldTime = new Date('2026-04-10T09:00:00.000Z');
		const now = new Date(oldTime.getTime() + ONE_HOUR_MS + 5_000);

		await writeFile(localPath, 'old-data');
		await writeFile(
			metadataPath,
			JSON.stringify({
				etag: '"old-etag"',
				lastModified: 'Thu, 10 Apr 2026 08:00:00 GMT',
				contentLength: 8
			})
		);
		await utimes(localPath, oldTime, oldTime);

		const fetchFn = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(
				new Response(null, {
					status: 200,
					headers: {
						etag: '"new-etag"',
						'last-modified': 'Thu, 10 Apr 2026 10:00:00 GMT',
						'content-length': '8'
					}
				})
			)
			.mockResolvedValueOnce(
				new Response('new-data', {
					status: 200,
					headers: {
						etag: '"new-etag"',
						'last-modified': 'Thu, 10 Apr 2026 10:00:00 GMT',
						'content-length': '8'
					}
				})
			);

		await ensureVaultPricesParquet({
			localPath,
			upstreamUrl: REMOTE_URL,
			fetchFn,
			now: () => now
		});

		expect(fetchFn).toHaveBeenCalledTimes(2);
		expect(await readFile(localPath, 'utf8')).toBe('new-data');
		expect(JSON.parse(await readFile(metadataPath, 'utf8'))).toMatchObject({ etag: '"new-etag"' });
		expect((await stat(localPath)).mtimeMs).toBe(now.getTime());
	});

	it('downloads the file when the local cache is missing', async () => {
		const dir = await makeTempDir();
		const localPath = join(dir, 'cleaned-vault-prices-1h.parquet');
		const now = new Date('2026-04-10T12:00:00.000Z');

		const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
			new Response('fresh-data', {
				status: 200,
				headers: {
					etag: '"fresh-etag"',
					'last-modified': 'Thu, 10 Apr 2026 12:00:00 GMT',
					'content-length': '10'
				}
			})
		);

		await ensureVaultPricesParquet({
			localPath,
			upstreamUrl: REMOTE_URL,
			fetchFn,
			now: () => now
		});

		expect(fetchFn).toHaveBeenCalledTimes(1);
		expect(await readFile(localPath, 'utf8')).toBe('fresh-data');
		expect(JSON.parse(await readFile(`${localPath}.cache.json`, 'utf8'))).toMatchObject({
			etag: '"fresh-etag"'
		});
	});
});
