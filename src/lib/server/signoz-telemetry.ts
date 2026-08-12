/**
 * SigNoz OpenTelemetry export — traces and console logs — running alongside
 * Datadog dd-trace and Sentry without touching either pipeline.
 *
 * Traces piggyback on Sentry's internally-created OTel TracerProvider via the
 * `openTelemetrySpanProcessors` init option: Sentry records 100% of spans
 * (`tracesSampleRate: 1.0`) so the OTLP exporter sees everything, while
 * `beforeSendTransaction` randomly thins what Sentry itself receives back to
 * the configured keep rate. Console logs are bridged to OTLP log records with
 * trace correlation from the active span context.
 *
 * Everything is disabled (byte-identical behaviour to an untouched build)
 * unless `OTEL_EXPORTER_OTLP_ENDPOINT` is set. Supported env vars:
 *
 * - `OTEL_EXPORTER_OTLP_ENDPOINT` — e.g. `http://signoz-host:4318`; master switch
 * - `OTEL_EXPORTER_OTLP_HEADERS` — optional collector auth, e.g. `signoz-ingestion-key=...`
 * - `OTEL_SERVICE_NAME` / `OTEL_RESOURCE_ATTRIBUTES` — resource metadata
 * - `TS_PRIVATE_SENTRY_TRANSACTION_SAMPLE_RATE` — fraction of transactions still
 *   sent to Sentry when SigNoz export is on (default 0.1)
 *
 * See docs/monitoring.md for the full architecture rationale.
 */
import { env } from '$env/dynamic/private';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SeverityNumber, logs } from '@opentelemetry/api-logs';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { Resource, envDetectorSync } from '@opentelemetry/resources';
import { format } from 'node:util';

/** SigNoz export is enabled only when the OTLP endpoint is configured */
export const signozEnabled = Boolean(env.OTEL_EXPORTER_OTLP_ENDPOINT);

// malformed/empty env values must fall back to 0.1, not silently become 0/NaN
const parsedKeepRate = Number(env.TS_PRIVATE_SENTRY_TRANSACTION_SAMPLE_RATE);
const sentryTransactionKeepRate =
	Number.isFinite(parsedKeepRate) && parsedKeepRate >= 0 && parsedKeepRate <= 1 ? parsedKeepRate : 0.1;

/**
 * Resource attributes for everything exported to SigNoz. `Resource.default()`
 * does NOT read `OTEL_SERVICE_NAME`/`OTEL_RESOURCE_ATTRIBUTES` (that's the env
 * detector's job), so detect explicitly and guarantee a service name.
 */
function signozResource() {
	return Resource.default()
		.merge(envDetectorSync.detect())
		.merge(new Resource({ 'service.name': env.OTEL_SERVICE_NAME ?? 'frontend' }));
}

/**
 * Sentry builds its TracerProvider resource itself (`service.name: "node"`),
 * which SigNoz would show as the service name. Substitute our resource on each
 * span at export time — the only hook available when piggybacking Sentry's
 * provider.
 */
class SignozResourceSpanExporter extends OTLPTraceExporter {
	#resource = signozResource();

	override export(...[spans, resultCallback]: Parameters<OTLPTraceExporter['export']>) {
		const patched = spans.map(
			(span) =>
				new Proxy(span, {
					get: (target, prop, receiver) => (prop === 'resource' ? this.#resource : Reflect.get(target, prop, receiver))
				})
		);
		super.export(patched, resultCallback);
	}
}

// kept for the SIGTERM flush — spans buffered in the batch processor would
// otherwise be lost on every graceful container stop
let spanProcessor: BatchSpanProcessor | undefined;

/**
 * Extra `Sentry.init` options enabling SigNoz trace export; `{}` when disabled
 * so the caller's defaults apply unchanged.
 */
export function signozSentryOptions() {
	if (!signozEnabled) return {};

	// exporter reads OTEL_EXPORTER_OTLP_ENDPOINT / OTEL_EXPORTER_OTLP_HEADERS
	spanProcessor ??= new BatchSpanProcessor(new SignozResourceSpanExporter());

	return {
		// record all spans so the OTLP processor exports 100% to SigNoz
		tracesSampleRate: 1.0,
		openTelemetrySpanProcessors: [spanProcessor],
		// thin Sentry's own transaction volume back down at send time; generic
		// signature because @sentry/sveltekit doesn't re-export TransactionEvent
		beforeSendTransaction: <T>(event: T) => (Math.random() < sentryTransactionKeepRate ? event : null)
	};
}

const consoleLevels = {
	log: SeverityNumber.INFO,
	info: SeverityNumber.INFO,
	warn: SeverityNumber.WARN,
	error: SeverityNumber.ERROR
} as const;

/**
 * Wrap console methods to also emit OTel log records to SigNoz. Original
 * console output is always preserved (Docker stdout logging is unaffected).
 * Records emitted during request handling automatically carry the active
 * span's trace_id/span_id (Sentry registers the global context manager).
 * No-op when SigNoz export is disabled.
 */
let consoleBridgeInstalled = false;

export function installConsoleLogBridge() {
	// idempotency guard: re-evaluation (e.g. Vite SSR reload) must not re-wrap
	// console, duplicate log records, or stack SIGTERM listeners
	if (!signozEnabled || consoleBridgeInstalled) return;
	consoleBridgeInstalled = true;

	const provider = new LoggerProvider({ resource: signozResource() });
	provider.addLogRecordProcessor(new BatchLogRecordProcessor(new OTLPLogExporter()));
	logs.setGlobalLoggerProvider(provider);
	const logger = logs.getLogger('console');

	// guard against telemetry internals logging through the bridged console
	let emitting = false;

	for (const [level, severityNumber] of Object.entries(consoleLevels)) {
		const original = console[level as keyof typeof consoleLevels].bind(console);
		console[level as keyof typeof consoleLevels] = (...args: unknown[]) => {
			original(...args);
			if (emitting) return;
			emitting = true;
			try {
				logger.emit({
					severityNumber,
					severityText: level.toUpperCase(),
					body: format(...args)
				});
			} catch {
				// telemetry must never break logging
			} finally {
				emitting = false;
			}
		};
	}

	// flush buffered log records and spans on container stop
	process.once('SIGTERM', () => {
		provider.shutdown().catch(() => {});
		spanProcessor?.shutdown().catch(() => {});
	});
}
