// src/lib/r2/client.ts

/**
 * Cloudflare R2 client — server-only.
 *
 * Uses the S3-compatible API to read objects from a private R2 bucket.
 * SvelteKit prevents client-side imports because this module reads
 * from `$env/dynamic/private`.
 */
import { env } from '$env/dynamic/private';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

function createClient(): S3Client | undefined {
	const accountId = env.TS_PRIVATE_R2_ACCOUNT_ID;
	const accessKeyId = env.TS_PRIVATE_R2_ACCESS_KEY_ID;
	const secretAccessKey = env.TS_PRIVATE_R2_SECRET_ACCESS_KEY;

	if (!accountId || !accessKeyId || !secretAccessKey) {
		return undefined;
	}

	return new S3Client({
		region: 'auto',
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: { accessKeyId, secretAccessKey }
	});
}

let _client: S3Client | undefined;

/** Lazily initialised S3Client — `undefined` when R2 is not configured. */
function getClient(): S3Client | undefined {
	if (!_client) {
		_client = createClient();
	}
	return _client;
}

/** Whether R2 credentials are configured. */
export function isR2Configured(): boolean {
	return (
		!!env.TS_PRIVATE_R2_ACCOUNT_ID &&
		!!env.TS_PRIVATE_R2_ACCESS_KEY_ID &&
		!!env.TS_PRIVATE_R2_SECRET_ACCESS_KEY &&
		!!env.TS_PRIVATE_R2_BUCKET_NAME
	);
}

/**
 * Fetch an R2 object as a readable stream with metadata.
 *
 * @param key Object key in the bucket (e.g. `top_vaults_by_chain.json`)
 * @returns Object body stream and metadata, or `null` when R2 is not configured
 * @throws When R2 is configured but the request fails
 */
export async function getR2Object(key: string) {
	const client = getClient();
	const bucket = env.TS_PRIVATE_R2_BUCKET_NAME;

	if (!client || !bucket) return null;

	const command = new GetObjectCommand({ Bucket: bucket, Key: key });
	const response = await client.send(command);

	return {
		body: response.Body,
		contentLength: response.ContentLength ?? null,
		lastModified: response.LastModified ?? null,
		contentType: response.ContentType ?? 'application/octet-stream'
	};
}

/**
 * Fetch object metadata (size, last-modified) without downloading the body.
 *
 * @param key Object key in the bucket
 * @returns Metadata, or `null` when R2 is not configured
 * @throws When R2 is configured but the request fails
 */
export async function headR2Object(key: string) {
	const client = getClient();
	const bucket = env.TS_PRIVATE_R2_BUCKET_NAME;

	if (!client || !bucket) return null;

	const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
	const response = await client.send(command);

	return {
		contentLength: response.ContentLength ?? null,
		lastModified: response.LastModified ?? null,
		contentType: response.ContentType ?? 'application/octet-stream'
	};
}
