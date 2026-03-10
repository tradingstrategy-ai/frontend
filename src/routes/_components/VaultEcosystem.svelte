<!--
@component
Lazily loaded "DeFi vault ecosystem" section for the frontpage. Uses
`svelte-inview` to detect scroll visibility and dynamically imports the
chart component + Plotly.js only when needed.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { inview } from 'svelte-inview';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import { resolve } from '$app/paths';

	interface Props {
		vaults: VaultInfo[];
		savingsRate: number | null;
		treasuryRate: number | null;
	}

	let { vaults, savingsRate, treasuryRate }: Props = $props();

	let visible = $state(false);
	let ChartComponent = $state<typeof import('./VaultEcosystemChart.svelte').default>();

	function onEnter() {
		if (visible) return;
		visible = true;
		import('./VaultEcosystemChart.svelte').then((m) => {
			ChartComponent = m.default;
		});
	}
</script>

<Section padding="md">
	<h2>Stablecoin vault earnings</h2>
	<div class="description ds-3">
		<span>What kind of returns stablecoin vault TVL is making</span>
	</div>
	<div use:inview={{ rootMargin: '200px' }} oninview_enter={onEnter}>
		{#if ChartComponent}
			<ChartComponent {vaults} {savingsRate} {treasuryRate} />
		{:else}
			<div class="skeleton-chart"></div>
		{/if}
	</div>
	<div class="cta">
		<Button secondary label="Explore vault data" href={resolve('/trading-view/vaults/cumulative-tvl-apy')} />
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
