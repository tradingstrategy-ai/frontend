<!--
@component
Server-derived cumulative TVL and annualised-return chart.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { ParamSchema } from '$lib/helpers/url-search-state';
	import { deserialiseSearchParams, serialiseSearchParams } from '$lib/helpers/url-search-state';
	import CumulativeTvlApyECharts from '$lib/echarts/CumulativeTvlApyChart.svelte';
	import { formatUsd } from '$lib/echarts/cumulative-tvl-apy';
	import type { CumulativeChartData } from '$lib/vault-chart-data';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	const LINEAR_APY_CAP = 15;
	interface Props {
		savingsRate: number | null;
		treasuryRate: number | null;
	}
	let { savingsRate, treasuryRate }: Props = $props();
	let error = $state<string | null>(null);
	let brokenProtocolLogos = $state<Record<string, true>>({});
	const timeWindows = [
		{ value: '1m', label: '1 month' },
		{ value: '3m', label: '3 months' },
		{ value: '6m', label: '6 months' },
		{ value: '1y', label: '1 year' },
		{ value: 'all', label: 'All time' }
	] as const;
	type TimeWindow = (typeof timeWindows)[number]['value'];
	const searchParamsSchema = {
		tvl: { type: 'number', defaultValue: 50_000 },
		window: { type: 'string', defaultValue: '1m', options: timeWindows.map((window) => window.value) },
		protocols: { type: 'string', defaultValue: '' },
		log: { type: 'string', defaultValue: '1', options: ['0', '1'] }
	} as const satisfies ParamSchema;
	let urlState = $derived(deserialiseSearchParams(page.url.searchParams, searchParamsSchema));
	let minTvl = $derived(urlState.tvl);
	let selectedWindow = $derived(urlState.window as TimeWindow);
	let selectedProtocols = $derived(urlState.protocols ? urlState.protocols.split(',').filter(Boolean) : []);
	let logAxes = $derived(urlState.log === '1');
	let chartData = $state<CumulativeChartData>();
	let loading = $state(true);

	function updateUrl(overrides: Partial<typeof urlState>) {
		const updated = { ...deserialiseSearchParams(page.url.searchParams, searchParamsSchema), ...overrides };
		const query = serialiseSearchParams(updated, searchParamsSchema);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(query ? `${page.url.pathname}?${query}` : page.url.pathname, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
	function isProtocolSelected(name: string) {
		return selectedProtocols.length === 0 || selectedProtocols.includes(name);
	}
	function hasUsableProtocolLogo(name: string, logoUrl: string | undefined) {
		return !!logoUrl && !brokenProtocolLogos[name];
	}
	function toggleProtocol(name: string) {
		const next = selectedProtocols.length === 0 ? [name] : [...selectedProtocols];
		if (selectedProtocols.length && next.includes(name)) next.splice(next.indexOf(name), 1);
		else if (selectedProtocols.length) next.push(name);
		updateUrl({ protocols: next.join(',') });
	}
	function markProtocolLogoBroken(name: string) {
		brokenProtocolLogos = { ...brokenProtocolLogos, [name]: true };
	}

	$effect(() => {
		let cancelled = false;
		loading = true;
		error = null;
		const query = new URLSearchParams({
			tvl: String(minTvl),
			window: selectedWindow,
			protocols: selectedProtocols.join(',')
		});
		fetch(`/vaults/cumulative-tvl-apy/chart-data?${query}`)
			.then((response) =>
				response.ok
					? (response.json() as Promise<CumulativeChartData>)
					: Promise.reject(new Error(`Chart request failed (${response.status})`))
			)
			.then((data) => {
				if (!cancelled) chartData = data;
			})
			.catch((cause) => {
				if (!cancelled) error = cause instanceof Error ? cause.message : 'Failed to load chart';
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	let protocolOptions = $derived(chartData?.protocolOptions ?? []);
	let points = $derived(chartData?.points ?? []);
	let totalTvl = $derived(points.reduce((total, point) => total + point.individualTvl, 0));
	let windowLabel = $derived(timeWindows.find((window) => window.value === selectedWindow)?.label ?? '1 month');
	const benchmarkUrls = {
		treasury: resolve('/glossary/risk-free-rate'),
		savings: resolve('/glossary/fdic-national-rate')
	};
</script>

<ScatterPlotShell
	className="standalone-cumulative-tvl-apy-shell"
	{loading}
	{error}
	{minTvl}
	onMinTvlChange={(value) => updateUrl({ tvl: value })}
>
	{#snippet extraControls()}
		<label
			>Returns lookback: <select
				value={selectedWindow}
				onchange={(event) => updateUrl({ window: event.currentTarget.value })}
				>{#each timeWindows as { value, label } (value)}<option {value}>{label}</option>{/each}</select
			></label
		>
		<label class="checkbox-label"
			><input type="checkbox" checked={logAxes} onchange={() => updateUrl({ log: logAxes ? '0' : '1' })} /> Logarithmic axes</label
		>
	{/snippet}
	{#snippet chartContent()}
		{#if !loading}<CumulativeTvlApyECharts
				{points}
				{savingsRate}
				{treasuryRate}
				{benchmarkUrls}
				{logAxes}
				linearXAxisCap={LINEAR_APY_CAP}
				returnsAxisLabel="Returns (annualised)"
				returnsTooltipLabel={`Returns annualised (${windowLabel})`}
				emptyMessage="No vaults with both TVL and CAGR data available for this time window."
				showTooltipLogos={true}
				showAxisNamesOnMobile={false}
				chartHeightDesktop={620}
				chartHeightMobile={440}
				axisTitleFontSize={16}
				axisLabelFontSize={13}
				tooltipFontSize={14}
				gridDesktop={{ top: 84, right: 88, bottom: 84, left: 88 }}
				gridMobile={{ top: 40, right: 24, bottom: 52, left: 18 }}
				variant="plain"
				className="standalone-cumulative-tvl-apy-chart"
				watermarkCorner="top-left"
				watermarkInset="relaxed"
				watermarkOpacity={0.05}
			/>{/if}
	{/snippet}
	{#snippet belowChart()}
		<p class="protocol-label">Select vault protocols</p>
		<div class="protocol-chips">
			{#each protocolOptions as { name, count, tvl, logoUrl } (name)}
				<button class="chip" class:active={isProtocolSelected(name)} onclick={() => toggleProtocol(name)}>
					<span class="chip-header">
						{#if hasUsableProtocolLogo(name, logoUrl)}
							<img class="chip-logo" src={logoUrl} alt="" loading="lazy" onerror={() => markProtocolLogoBroken(name)} />
						{:else}
							<span class="chip-logo chip-logo-fallback" aria-hidden="true"></span>
						{/if}
						<span class="chip-name">{name}</span>
					</span>
					<span class="chip-meta">{formatUsd(tvl)} · {count} vault{count === 1 ? '' : 's'}</span>
				</button>
			{/each}
		</div>
		<p class="vault-count">
			Showing {chartData?.selectedCount ?? 0} of {chartData?.matchingCount ?? 0} vault{(chartData?.matchingCount ??
				0) === 1
				? ''
				: 's'} · Total TVL: {formatUsd(totalTvl)}
		</p>
	{/snippet}
</ScatterPlotShell>

<style>
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
	}
	.protocol-label {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-bottom: 0.25rem;
		margin-top: 0.75rem;
	}
	.protocol-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		justify-content: center;
		padding: 0.25rem;
	}
	.chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		align-items: flex-start;
		gap: 0.125rem;
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		background: var(--c-box-2);
		color: var(--c-text-extra-light);
		padding: 0.375rem 0.75rem;
		font: var(--f-ui-xs-roman);
		cursor: pointer;
		transition: all 0.15s ease;
		opacity: 0.82;
	}
	.chip.active {
		background: var(--c-box-3);
		color: var(--c-text);
		opacity: 1;
		border-color: color-mix(in srgb, var(--c-text-light), transparent 60%);
	}
	.chip:hover {
		background: color-mix(in srgb, var(--c-box-2), var(--c-text-light) 10%);
		border-color: color-mix(in srgb, var(--c-text-light), transparent 35%);
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 82%),
			0 0.5rem 1rem color-mix(in srgb, var(--c-text-light), transparent 92%);
		color: var(--c-text);
		opacity: 1;
	}
	.chip-name {
		font: var(--f-ui-xs-medium);
	}
	.chip-header {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.chip-meta {
		font: var(--f-ui-3xs-roman);
		color: var(--c-text-extra-light);
		white-space: nowrap;
	}
	.chip-logo {
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		object-fit: contain;
		flex: 0 0 auto;
	}
	.chip-logo-fallback {
		display: inline-block;
		background: color-mix(in srgb, var(--c-text-ultra-light), var(--c-box-3) 55%);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 82%);
	}
	.vault-count {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-top: 0.75rem;
	}
	:global(.standalone-cumulative-tvl-apy-chart .chart) {
		min-height: 620px;
	}
	:global(.standalone-cumulative-tvl-apy-shell .chart-surface) {
		border-color: color-mix(in srgb, var(--c-box-4), var(--c-text-light) 14%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 60%),
				color-mix(in srgb, var(--c-box-2), var(--c-text-inverted) 76%)
			),
			radial-gradient(circle at top left, color-mix(in srgb, var(--c-bullish), transparent 90%) 0%, transparent 20%),
			linear-gradient(145deg, color-mix(in srgb, var(--c-text-light), transparent 96%), transparent 20%),
			color-mix(in srgb, var(--c-box-1), var(--c-text-inverted) 18%);
		box-shadow:
			0 1.5rem 3rem color-mix(in srgb, var(--c-text-inverted), transparent 82%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 78%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 94%);
	}
	:global(.standalone-cumulative-tvl-apy-shell .chart-surface::before) {
		background: radial-gradient(
			circle at top,
			color-mix(in srgb, var(--c-text-light), transparent 90%) 0%,
			transparent 52%
		);
		opacity: 0.58;
	}
	:global(.standalone-cumulative-tvl-apy-shell .chart-surface::after) {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--c-text-inverted), transparent 94%) 0%,
			transparent 24%,
			color-mix(in srgb, var(--c-text-inverted), transparent 90%) 100%
		);
		opacity: 0.92;
	}
</style>
