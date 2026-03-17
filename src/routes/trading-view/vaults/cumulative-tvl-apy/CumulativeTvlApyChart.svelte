<!--
@component
Standalone cumulative TVL / APY page adapter using the shared ECharts renderer.

@example
```svelte
  <CumulativeTvlApyChart vaults={topVaults.vaults} {savingsRate} {treasuryRate} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { ParamSchema } from '$lib/helpers/url-search-state';
	import CumulativeTvlApyECharts from '$lib/echarts/CumulativeTvlApyChart.svelte';
	import { buildCumulativeTvlPoints, formatUsd, getEligibleItems } from '$lib/echarts/cumulative-tvl-apy';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import { resolveVaultDetails } from '$lib/top-vaults/helpers';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { deserialiseSearchParams, serialiseSearchParams } from '$lib/helpers/url-search-state';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	const MAX_APY_THRESHOLD = 10; // 1000%
	const LINEAR_APY_CAP = 15; // Cap X axis at 15% in linear mode for readability

	interface Props {
		vaults: VaultInfo[];
		savingsRate: number | null;
		treasuryRate: number | null;
		dataLoading?: boolean;
	}

	let { vaults, savingsRate, treasuryRate, dataLoading = false }: Props = $props();

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
		window: { type: 'string', defaultValue: '1m', options: timeWindows.map((w) => w.value) },
		protocols: { type: 'string', defaultValue: '' },
		log: { type: 'string', defaultValue: '1', options: ['0', '1'] }
	} as const satisfies ParamSchema;

	let urlState = $derived(deserialiseSearchParams(page.url.searchParams, searchParamsSchema));

	let minTvl = $derived(urlState.tvl);
	let selectedWindow = $derived(urlState.window as TimeWindow);
	let selectedProtocols = $derived(urlState.protocols ? urlState.protocols.split(',').filter(Boolean) : []);
	let logAxes = $derived(urlState.log === '1');

	function updateUrl(overrides: Partial<typeof urlState>) {
		const current = deserialiseSearchParams(page.url.searchParams, searchParamsSchema);
		const updated = { ...current, ...overrides };
		const qs = serialiseSearchParams(updated, searchParamsSchema);
		const href = qs ? `${page.url.pathname}?${qs}` : page.url.pathname;
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(href, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function isProtocolSelected(name: string) {
		return selectedProtocols.length === 0 || selectedProtocols.includes(name);
	}

	function hasUsableProtocolLogo(name: string, logoUrl: string | undefined) {
		return !!logoUrl && !brokenProtocolLogos[name];
	}

	function markProtocolLogoBroken(name: string) {
		brokenProtocolLogos = { ...brokenProtocolLogos, [name]: true };
	}

	/**
	 * Get the CAGR value for a vault based on the selected time window.
	 * Uses top-level fields for 1m/3m/lifetime; period_results for 6m/1y.
	 */
	function getVaultCagr(v: VaultInfo, window: TimeWindow): number | null {
		switch (window) {
			case '1m':
				return v.one_month_cagr_net ?? v.one_month_cagr;
			case '3m':
				return v.three_months_cagr_net ?? v.three_months_cagr;
			case '6m': {
				const period = v.period_results?.find((p) => p.period.toLowerCase() === '6m');
				return period?.cagr_net ?? period?.cagr_gross ?? null;
			}
			case '1y': {
				const period = v.period_results?.find((p) => p.period.toLowerCase() === '1y');
				return period?.cagr_net ?? period?.cagr_gross ?? null;
			}
			case 'all':
				return v.cagr_net ?? v.cagr;
		}
	}

	/** All eligible vaults sorted by APY descending. */
	let allEligible = $derived(
		getEligibleItems(vaults, {
			getApy: (vault) => getVaultCagr(vault, selectedWindow),
			getTvl: (vault) => vault.current_nav,
			isBlacklisted,
			minTvl,
			maxApyThreshold: MAX_APY_THRESHOLD
		})
	);

	/** Unique protocols with TVL totals and vault counts, sorted by TVL desc then count desc then name. */
	let protocolOptions = $derived(() => {
		const stats: Record<string, { count: number; tvl: number; logoUrl?: string }> = {};
		for (const v of allEligible) {
			const name = v.protocol ?? 'Unknown';
			const tvl = v.current_nav ?? 0;
			stats[name] ??= { count: 0, tvl: 0, logoUrl: getVaultProtocolLogoUrl(v.protocol_slug) };
			stats[name].count += 1;
			stats[name].tvl += tvl;
		}
		return Object.entries(stats)
			.map(([name, { count, tvl, logoUrl }]) => ({ name, count, tvl, logoUrl }))
			.toSorted(
				(left, right) => right.tvl - left.tvl || right.count - left.count || left.name.localeCompare(right.name)
			);
	});

	/** Toggle a protocol in the selection set. */
	function toggleProtocol(name: string) {
		const allActive = selectedProtocols.length === 0;
		const next = [...selectedProtocols];

		if (allActive) {
			next.push(name);
		} else if (next.includes(name)) {
			next.splice(next.indexOf(name), 1);
		} else {
			next.push(name);
		}

		updateUrl({ protocols: next.join(',') });
	}

	/** Vaults filtered by selected protocols. */
	let protocolFiltered = $derived(
		selectedProtocols.length === 0
			? allEligible
			: allEligible.filter((v) => selectedProtocols.includes(v.protocol ?? 'Unknown'))
	);

	let displayedVaults = $derived(protocolFiltered);

	/** Total TVL across displayed vaults. */
	let totalTvl = $derived(displayedVaults.reduce((sum, v) => sum + (v.current_nav ?? 0), 0));

	const benchmarkUrls = {
		treasury: resolve('/glossary/risk-free-rate'),
		savings: resolve('/glossary/fdic-national-rate')
	};

	let windowLabel = $derived(timeWindows.find((window) => window.value === selectedWindow)?.label ?? '1 month');

	let chartPoints = $derived(
		buildCumulativeTvlPoints(
			displayedVaults.map((vault) => ({
				name: vault.name,
				chain: vault.chain ?? 'Unknown',
				chainLogoUrl: getLogoUrl('blockchain', getChain(vault.chain_id)?.slug),
				protocol: vault.protocol ?? 'Unknown',
				protocolLogoUrl: getVaultProtocolLogoUrl(vault.protocol_slug),
				realApy: (getVaultCagr(vault, selectedWindow) ?? 0) * 100,
				individualTvl: vault.current_nav ?? 0,
				url: resolveVaultDetails(vault)
			}))
		)
	);
</script>

<ScatterPlotShell
	className="standalone-cumulative-tvl-apy-shell"
	loading={dataLoading}
	{error}
	{minTvl}
	onMinTvlChange={(v) => updateUrl({ tvl: v })}
>
	{#snippet extraControls()}
		<label>
			Returns lookback:
			<select value={selectedWindow} onchange={(e) => updateUrl({ window: e.currentTarget.value })}>
				{#each timeWindows as { value, label } (value)}
					<option {value} selected={value === selectedWindow}>{label}</option>
				{/each}
			</select>
		</label>
		<label class="checkbox-label">
			<input type="checkbox" checked={logAxes} onchange={() => updateUrl({ log: logAxes ? '0' : '1' })} />
			Logarithmic axes
		</label>
	{/snippet}
	{#snippet chartContent()}
		{#if !dataLoading}
			<CumulativeTvlApyECharts
				points={chartPoints}
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
			/>
		{/if}
	{/snippet}
	{#snippet belowChart()}
		<p class="protocol-label">Select vault protocols</p>
		<div class="protocol-chips">
			{#each protocolOptions() as { name, count, tvl, logoUrl } (name)}
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
			Showing {displayedVaults.length} of {allEligible.length} vault{allEligible.length === 1 ? '' : 's'}
			· Total TVL: {formatUsd(totalTvl)}
		</p>
	{/snippet}
</ScatterPlotShell>

<style>
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
		align-items: flex-start;
		gap: 0.125rem;
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		background: var(--c-box-2);
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-roman);
		cursor: pointer;
		transition: all 0.15s ease;
		opacity: 0.82;

		&.active {
			background: var(--c-box-3);
			color: var(--c-text);
			opacity: 1;
			border-color: color-mix(in srgb, var(--c-text-light), transparent 60%);
		}

		&:hover {
			background: color-mix(in srgb, var(--c-box-2), var(--c-text-light) 10%);
			border-color: color-mix(in srgb, var(--c-text-light), transparent 35%);
			box-shadow:
				0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 82%),
				0 0.5rem 1rem color-mix(in srgb, var(--c-text-light), transparent 92%);
			color: var(--c-text);
			opacity: 1;
		}
	}

	.chip-name {
		font: var(--f-ui-xs-medium);
	}

	.chip-header {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
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

	.chip-meta {
		font: var(--f-ui-3xs-roman);
		color: var(--c-text-extra-light);
		white-space: nowrap;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
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
