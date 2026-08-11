#!/usr/bin/env node

/**
 * Check the external services used by the production frontend.
 *
 * This intentionally reads only process.env so it can run in the production
 * image with exactly the same configuration as the SvelteKit server:
 *
 *   docker compose run --rm frontend node scripts/check-connectivity.mjs
 *
 * Secrets are used only for authenticated requests and are never printed.
 */
import dgram from 'node:dgram';
import { stat } from 'node:fs/promises';

const timeoutMs = Number.parseInt(process.env.CONNECTIVITY_TIMEOUT_MS ?? '10000', 10);
const results = [];
let topVaults;

function configured(name) {
	const value = process.env[name]?.trim();
	return value || undefined;
}

function displayUrl(value) {
	try {
		const url = new URL(value);
		return `${url.protocol}//${url.host}${url.pathname}`;
	} catch {
		return '<invalid URL>';
	}
}

function joinUrl(base, path) {
	return new URL(path.replace(/^\//, ''), `${base.replace(/\/$/, '')}/`).toString();
}

function requiredEnvironment(names) {
	return names.every((name) => configured(name));
}

function record(name, severity, state, detail) {
	results.push({ name, severity, state, detail });
}

async function check(name, severity, callback) {
	try {
		const detail = await callback();
		record(name, severity, 'PASS', detail);
		return detail;
	} catch (error) {
		record(name, severity, 'FAIL', error instanceof Error ? error.message : String(error));
		return undefined;
	}
}

function skip(name, severity, detail) {
	record(name, severity, 'SKIP', detail);
}

async function request(url, options = {}) {
	const response = await fetch(url, {
		redirect: 'manual',
		...options,
		signal: AbortSignal.timeout(timeoutMs),
		headers: {
			'User-Agent': 'trading-strategy-frontend-connectivity-check/1.0',
			...options.headers
		}
	});
	return response;
}

async function expectResponse(url, { acceptedStatuses, ...options } = {}) {
	const response = await request(url, options);
	const accepted = acceptedStatuses ? acceptedStatuses.includes(response.status) : response.ok;

	if (!accepted) {
		throw new Error(`${displayUrl(url)} returned HTTP ${response.status}`);
	}

	return response;
}

async function readJson(response, label) {
	try {
		return await response.json();
	} catch {
		throw new Error(`${label} returned invalid JSON`);
	}
}

function parseStrategies() {
	const source = configured('TS_PUBLIC_STRATEGIES');
	if (!source) throw new Error('TS_PUBLIC_STRATEGIES is not configured');

	let strategies;
	try {
		strategies = JSON.parse(source);
	} catch {
		throw new Error('TS_PUBLIC_STRATEGIES is not valid JSON');
	}

	if (!Array.isArray(strategies)) throw new Error('TS_PUBLIC_STRATEGIES must be a JSON array');

	for (const strategy of strategies) {
		if (!strategy || typeof strategy.id !== 'string' || typeof strategy.url !== 'string') {
			throw new Error('Every strategy needs string id and url fields');
		}
		try {
			new URL(strategy.url);
		} catch {
			throw new Error(`Strategy ${strategy.id} has an invalid URL`);
		}
	}

	return strategies;
}

async function loadTopVaults() {
	const r2Environment = [
		'TS_PRIVATE_R2_ACCOUNT_ID',
		'TS_PRIVATE_R2_ACCESS_KEY_ID',
		'TS_PRIVATE_R2_SECRET_ACCESS_KEY',
		'TS_PRIVATE_R2_BUCKET_NAME'
	];

	let data;
	if (requiredEnvironment(r2Environment)) {
		const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3');
		const client = new S3Client({
			region: 'auto',
			endpoint: `https://${configured('TS_PRIVATE_R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: configured('TS_PRIVATE_R2_ACCESS_KEY_ID'),
				secretAccessKey: configured('TS_PRIVATE_R2_SECRET_ACCESS_KEY')
			}
		});
		const response = await client.send(
			new GetObjectCommand({
				Bucket: configured('TS_PRIVATE_R2_BUCKET_NAME'),
				Key: 'top_vaults_by_chain.json'
			})
		);
		if (!response.Body) throw new Error('R2 returned an empty top-vaults object');
		try {
			data = JSON.parse(await response.Body.transformToString());
		} catch {
			throw new Error('R2 top-vaults object is not valid JSON');
		}
	} else {
		const source = configured('TS_PRIVATE_TOP_VAULTS_URL');
		if (!source) {
			throw new Error('Neither complete R2 credentials nor TS_PRIVATE_TOP_VAULTS_URL is configured');
		}
		const response = await expectResponse(source);
		data = await readJson(response, 'Top-vaults fallback');
	}

	if (!data || !Array.isArray(data.vaults) || data.vaults.length === 0) {
		throw new Error('Top-vaults data has no vaults array');
	}
	return data;
}

async function sendDogStatsdDatagram(url) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error('DD_DOGSTATSD_URL is not a valid URL');
	}
	if (parsed.protocol !== 'udp:' || !parsed.hostname || !parsed.port) {
		throw new Error('Only udp://host:port DD_DOGSTATSD_URL values can be checked');
	}

	const socket = dgram.createSocket('udp4');
	try {
		await new Promise((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error('UDP connection timed out')), timeoutMs);
			socket.once('error', reject);
			socket.connect(Number(parsed.port), parsed.hostname, () => {
				clearTimeout(timer);
				resolve();
			});
		});
		await new Promise((resolve, reject) =>
			socket.send('frontend.connectivity_check:1|c', (error) => (error ? reject(error) : resolve()))
		);
	} finally {
		socket.close();
	}
}

function printResults() {
	const width = Math.max(...results.map((result) => result.name.length), 7);
	console.log('\nFrontend connectivity report');
	console.log(`Timeout per HTTP check: ${timeoutMs} ms\n`);

	for (const result of results) {
		console.log(
			`${result.state.padEnd(4)} ${result.severity.padEnd(8)} ${result.name.padEnd(width)}  ${result.detail}`
		);
	}

	const failures = results.filter((result) => result.state === 'FAIL');
	const skipped = results.filter((result) => result.state === 'SKIP');
	console.log(
		`\n${failures.length === 0 ? 'ALL CONFIGURED SERVICES ARE REACHABLE' : `${failures.length} CHECK(S) FAILED`}`
	);
	if (skipped.length) console.log(`${skipped.length} optional check(s) skipped because they are not configured.`);
	if (failures.length) process.exitCode = 1;
}

async function main() {
	const backendUrl = configured('TS_PUBLIC_BACKEND_INTERNAL_URL') ?? configured('TS_PUBLIC_BACKEND_URL');
	let strategies = [];

	await check('Runtime configuration', 'REQUIRED', async () => {
		const siteMode = configured('TS_PUBLIC_SITE_MODE') ?? 'local';
		if (!['local', 'staging', 'production'].includes(siteMode)) {
			throw new Error(`TS_PUBLIC_SITE_MODE has unsupported value ${siteMode}`);
		}
		if (!configured('TS_PUBLIC_BACKEND_URL')) throw new Error('TS_PUBLIC_BACKEND_URL is not configured');
		if (!configured('FRONTEND_PROTOCOL_HEADER') || !configured('FRONTEND_HOST_HEADER')) {
			throw new Error('FRONTEND_PROTOCOL_HEADER and FRONTEND_HOST_HEADER are required by adapter-node');
		}
		strategies = parseStrategies();
		return `${strategies.length} strategy configuration(s), mode ${siteMode}`;
	});

	if (backendUrl) {
		await check('Backend API', 'REQUIRED', async () => {
			const response = await expectResponse(backendUrl, {
				acceptedStatuses: [200, 201, 202, 204, 301, 302, 307, 308, 400, 401, 403, 404, 405]
			});
			return `${displayUrl(backendUrl)} responded HTTP ${response.status}`;
		});
	} else {
		record('Backend API', 'REQUIRED', 'FAIL', 'No backend URL configured');
	}

	for (const strategy of strategies) {
		await check(`Strategy ${strategy.id}`, 'REQUIRED', async () => {
			const metadataUrl = joinUrl(strategy.url, 'metadata');
			const response = await expectResponse(metadataUrl);
			const metadata = await readJson(response, `Strategy ${strategy.id} metadata`);
			if (!metadata || typeof metadata !== 'object') throw new Error('Metadata is not an object');
			return `${displayUrl(metadataUrl)} responded HTTP ${response.status}`;
		});
	}

	await check('Top-vaults source', 'REQUIRED', async () => {
		const data = await loadTopVaults();
		topVaults = data;
		return `${data.vaults.length} vaults loaded via ${
			requiredEnvironment([
				'TS_PRIVATE_R2_ACCOUNT_ID',
				'TS_PRIVATE_R2_ACCESS_KEY_ID',
				'TS_PRIVATE_R2_SECRET_ACCESS_KEY',
				'TS_PRIVATE_R2_BUCKET_NAME'
			])
				? 'R2'
				: 'the fallback URL'
		}`;
	});

	await check('Vault-price cache', 'OPTIONAL', async () => {
		const cache = await stat('data/cleaned-vault-prices-1h.parquet');
		if (cache.size === 0) throw new Error('data/cleaned-vault-prices-1h.parquet is empty');
		return `data/cleaned-vault-prices-1h.parquet is ${Math.round(cache.size / 1024 / 1024)} MiB`;
	});

	await check('FRED reference rate', 'OPTIONAL', async () => {
		const response = await expectResponse('https://fred.stlouisfed.org/graph/fredgraph.csv?id=SNDR', {
			headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0' }
		});
		const text = await response.text();
		if (!text.split('\n', 1)[0].toLowerCase().includes('observation_date')) {
			throw new Error('FRED response is not a CSV series');
		}
		return 'SNDR CSV retrieved';
	});

	await check('US Treasury rates', 'OPTIONAL', async () => {
		const response = await expectResponse(
			'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page%5Bsize%5D=1&filter=security_desc:eq:Treasury%20Notes'
		);
		const data = await readJson(response, 'US Treasury rates');
		if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Treasury response has no rate data');
		return 'latest Treasury note rate retrieved';
	});

	const ghostUrl = configured('TS_PUBLIC_GHOST_API_URL');
	const ghostKey = configured('TS_PUBLIC_GHOST_CONTENT_API_KEY');
	if (ghostUrl || ghostKey) {
		if (!ghostUrl || !ghostKey) {
			record('Ghost content API', 'OPTIONAL', 'FAIL', 'Both Ghost URL and content API key are required');
		} else {
			await check('Ghost content API', 'OPTIONAL', async () => {
				const url = new URL(joinUrl(ghostUrl, 'ghost/api/content/posts/'));
				url.searchParams.set('limit', '1');
				url.searchParams.set('key', ghostKey);
				const response = await expectResponse(url);
				const data = await readJson(response, 'Ghost content API');
				if (!Array.isArray(data.posts)) throw new Error('Ghost response has no posts array');
				return `${displayUrl(ghostUrl)} returned ${data.posts.length} post(s)`;
			});
		}
	} else {
		skip('Ghost content API', 'OPTIONAL', 'Not configured');
	}

	const stablecoinUrl = configured('TS_PUBLIC_STABLECOIN_METADATA_URL');
	if (stablecoinUrl) {
		await check('Stablecoin metadata', 'OPTIONAL', async () => {
			const response = await expectResponse(joinUrl(stablecoinUrl, 'index.json'));
			const data = await readJson(response, 'Stablecoin metadata');
			if (!Array.isArray(data)) throw new Error('Metadata index is not an array');
			return `${displayUrl(stablecoinUrl)} returned ${data.length} entries`;
		});
	} else {
		skip('Stablecoin metadata', 'OPTIONAL', 'Not configured');
	}

	const protocolUrl = configured('TS_PUBLIC_VAULT_PROTOCOL_METADATA_URL');
	const sampleVault = topVaults?.vaults.find((vault) => vault.protocol_slug && vault.id);
	if (protocolUrl && sampleVault) {
		await check('Vault protocol metadata', 'OPTIONAL', async () => {
			const url = joinUrl(protocolUrl, `${sampleVault.protocol_slug}/metadata.json`);
			const response = await expectResponse(url);
			const data = await readJson(response, 'Vault protocol metadata');
			if (!data || typeof data !== 'object') throw new Error('Protocol metadata is not an object');
			return `${displayUrl(url)} responded HTTP ${response.status}`;
		});
	} else {
		skip('Vault protocol metadata', 'OPTIONAL', protocolUrl ? 'Top-vaults source unavailable' : 'Not configured');
	}

	const sparklinesUrl = configured('TS_PUBLIC_VAULT_SPARKLINES_URL');
	if (sparklinesUrl && sampleVault) {
		await check('Vault sparklines', 'OPTIONAL', async () => {
			const url = joinUrl(sparklinesUrl, `sparkline-90d-${sampleVault.id}.svg`);
			const response = await expectResponse(url);
			const text = await response.text();
			if (!text.includes('<svg')) throw new Error('Sparkline response is not SVG');
			return `${displayUrl(url)} responded HTTP ${response.status}`;
		});
	} else {
		skip('Vault sparklines', 'OPTIONAL', sparklinesUrl ? 'Top-vaults source unavailable' : 'Not configured');
	}

	const sampleDataUrl = configured('TS_PUBLIC_SAMPLE_DATA_URL') ?? 'https://vault-protocol-metadata.tradingstrategy.ai';
	await check('Public sample data CDN', 'OPTIONAL', async () => {
		const url = joinUrl(sampleDataUrl, 'vault-metadata.sample.json');
		const response = await expectResponse(url, { method: 'HEAD' });
		return `${displayUrl(url)} responded HTTP ${response.status}`;
	});

	const vaultApiUrl = configured('TS_PUBLIC_VAULT_API_URL');
	if (vaultApiUrl) {
		await check('Vault data API', 'OPTIONAL', async () => {
			const url = joinUrl(vaultApiUrl, 'files/top_vaults_by_chain.json');
			const response = await expectResponse(url, { acceptedStatuses: [200, 401, 403] });
			return `${displayUrl(url)} responded HTTP ${response.status}${response.status === 401 || response.status === 403 ? ' (authentication enforced)' : ''}`;
		});
	} else {
		skip('Vault data API', 'OPTIONAL', 'Not configured');
	}

	const mailerLiteUrl = configured('TS_PRIVATE_MAILERLITE_URL');
	const mailerLiteKey = configured('TS_PRIVATE_MAILERLITE_API_KEY');
	if (mailerLiteUrl || mailerLiteKey) {
		if (!mailerLiteUrl || !mailerLiteKey) {
			record('MailerLite API', 'OPTIONAL', 'FAIL', 'Both MailerLite URL and API key are required');
		} else {
			await check('MailerLite API', 'OPTIONAL', async () => {
				const url = joinUrl(mailerLiteUrl, 'api/subscribers?limit=1');
				const response = await expectResponse(url, { headers: { Authorization: `Bearer ${mailerLiteKey}` } });
				return `${displayUrl(url)} responded HTTP ${response.status}`;
			});
		}
	} else {
		skip('MailerLite API', 'OPTIONAL', 'Not configured');
	}

	const sentryDsn = configured('TS_PUBLIC_SENTRY_DSN');
	if (sentryDsn) {
		await check('Sentry ingestion host', 'OPTIONAL', async () => {
			const dsn = new URL(sentryDsn);
			const response = await expectResponse(dsn.origin, {
				acceptedStatuses: [200, 301, 302, 307, 308, 400, 401, 403, 404, 405]
			});
			return `${dsn.origin} responded HTTP ${response.status}`;
		});
	} else {
		skip('Sentry ingestion host', 'OPTIONAL', 'Not configured');
	}

	const turnstileKey = configured('TS_PUBLIC_TURNSTILE_SITE_KEY');
	if (turnstileKey) {
		await check('Cloudflare Turnstile', 'OPTIONAL', async () => {
			const response = await expectResponse('https://challenges.cloudflare.com/turnstile/v0/api.js');
			return `widget script responded HTTP ${response.status}`;
		});
	} else {
		skip('Cloudflare Turnstile', 'OPTIONAL', 'Not configured');
	}

	const rpcSource = configured('TS_PUBLIC_RPC_URLS');
	if (rpcSource) {
		let rpcUrls;
		try {
			rpcUrls = JSON.parse(rpcSource);
		} catch {
			record('Blockchain RPC configuration', 'OPTIONAL', 'FAIL', 'TS_PUBLIC_RPC_URLS is not valid JSON');
		}
		if (rpcUrls && typeof rpcUrls === 'object' && !Array.isArray(rpcUrls)) {
			for (const [chainId, rpcUrl] of Object.entries(rpcUrls)) {
				await check(`Blockchain RPC ${chainId}`, 'OPTIONAL', async () => {
					if (typeof rpcUrl !== 'string') throw new Error('RPC URL is not a string');
					const response = await expectResponse(rpcUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] })
					});
					const data = await readJson(response, `Blockchain RPC ${chainId}`);
					if (typeof data.result !== 'string') throw new Error('eth_chainId returned no result');
					return `${displayUrl(rpcUrl)} returned chain ID ${data.result}`;
				});
			}
		}
	} else {
		skip('Blockchain RPCs', 'OPTIONAL', 'Not configured');
	}

	const datadogProduction = configured('DD_ENV') === 'prod';
	const traceAgentUrl = configured('DD_TRACE_AGENT_URL');
	if (traceAgentUrl) {
		await check('Datadog trace agent', 'OPTIONAL', async () => {
			const url = joinUrl(traceAgentUrl, 'info');
			const response = await expectResponse(url);
			return `${displayUrl(url)} responded HTTP ${response.status}`;
		});
	} else {
		if (datadogProduction) {
			record('Datadog trace agent', 'OPTIONAL', 'FAIL', 'DD_TRACE_AGENT_URL is not configured');
		} else {
			skip('Datadog trace agent', 'OPTIONAL', 'DD_TRACE_AGENT_URL is not configured');
		}
	}

	const dogstatsdUrl = configured('DD_DOGSTATSD_URL');
	if (dogstatsdUrl) {
		await check('Datadog DogStatsD', 'OPTIONAL', async () => {
			await sendDogStatsdDatagram(dogstatsdUrl);
			return 'UDP datagram sent (UDP delivery cannot be acknowledged)';
		});
	} else {
		if (datadogProduction) {
			record('Datadog DogStatsD', 'OPTIONAL', 'FAIL', 'DD_DOGSTATSD_URL is not configured');
		} else {
			skip('Datadog DogStatsD', 'OPTIONAL', 'DD_DOGSTATSD_URL is not configured');
		}
	}

	printResults();
}

await main();
