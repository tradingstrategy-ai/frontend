<!--
@component
Lazily loaded "DeFi vault ecosystem" section for the frontpage. Uses
`svelte-inview` to detect scroll visibility and dynamically imports the
chart component only when needed.
-->
<script lang="ts">
	import type { SlimVaultInfo } from '$lib/top-vaults/schemas';
	import { inview } from 'svelte-inview';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import { resolve } from '$app/paths';

	interface Props {
		savingsRate: number | null;
		treasuryRate: number | null;
	}

	let { savingsRate, treasuryRate }: Props = $props();

	let visible = $state(false);
	let ChartComponent = $state<typeof import('./VaultEcosystemChartECharts.svelte').default>();
	let chartVaults = $state<SlimVaultInfo[]>();
	let loadError = $state(false);

	async function onEnter() {
		if (visible) return;
		visible = true;
		try {
			const [module, response] = await Promise.all([
				import('./VaultEcosystemChartECharts.svelte'),
				fetch('/top-vaults/chart-data')
			]);
			if (!response.ok) throw new Error(`Chart data request failed: ${response.status}`);
			ChartComponent = module.default;
			chartVaults = (await response.json()).vaults;
		} catch (e) {
			console.error('Failed to load vault ecosystem chart data:', e);
			loadError = true;
		}
	}
</script>

<Section padding="md" --section-background="var(--c-background-accent-1)">
	<h2>See where stablecoin capital earns more</h2>
	<div class="description ds-3">
		<span>Compare yields, TVL and momentum across the biggest stablecoin vault ecosystems</span>
	</div>
	<div use:inview={{ rootMargin: '200px' }} oninview_enter={onEnter}>
		{#if ChartComponent && chartVaults}
			<ChartComponent vaults={chartVaults} {savingsRate} {treasuryRate} />
		{:else if loadError}
			<p class="load-error">Data failed to load</p>
		{:else}
			<div class="skeleton-chart"></div>
		{/if}
	</div>
	<div class="cta">
		<Button secondary label="Compare vault ecosystems" href={resolve('/trading-view/vaults/cumulative-tvl-apy')} />
	</div>
</Section>

<style>
	:is(h2, div) {
		text-align: center;
	}

	.description {
		margin-block: 0.5rem 1rem;
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--ls-ui-lg);
		line-height: 1.5;
		color: var(--c-text-extra-light);

		span {
			@media (--viewport-md-up) {
				display: block;
			}
		}
	}

	.load-error {
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-xs);
		background: var(--c-box-3);
		color: var(--c-text-extra-light);
		font: var(--f-ui-lg-medium);
	}

	.skeleton-chart {
		height: 400px;
		border-radius: var(--radius-xs);
		background: var(--c-box-3);
		animation: pulse-opacity 1s infinite ease-out;
	}

	.cta {
		margin-top: 1rem;
	}
</style>
