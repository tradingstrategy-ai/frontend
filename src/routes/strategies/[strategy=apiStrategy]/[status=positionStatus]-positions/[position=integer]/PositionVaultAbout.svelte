<!--
@component
Compact vault metadata card for vault position detail pages.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import VaultSparkline from '$lib/top-vaults/VaultSparkline.svelte';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { formatDollar, formatNumber, formatPercentProfit } from '$lib/helpers/formatters';
	import { getVaultCurrentTvlUsd, getVaultProtocolDisplayName } from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let description = $derived(vault.short_description ?? vault.description ?? '');
	let threeMonthCagr = $derived(vault.three_months_cagr_net ?? vault.three_months_cagr);
	let datasheetHref = $derived(resolve(`/vaults/${vault.vault_slug}`));
	let protocolName = $derived(getVaultProtocolDisplayName(vault));
</script>

<MetricsBox class="position-vault-about" title="About {vault.name} vault">
	<div class="about-content">
		<div class="description">
			<p>
				This position is held on {vault.name} on {protocolName}.
				{#if description}
					{description}
				{/if}
			</p>
			<a href={datasheetHref}>View full information</a>
		</div>

		<dl>
			<div>
				<dt>TVL</dt>
				<dd>{formatDollar(getVaultCurrentTvlUsd(vault), 1)}</dd>
			</div>
			<div>
				<dt>Age</dt>
				<dd>{formatNumber(vault.years, 1)} years</dd>
			</div>
			<div>
				<dt>3M Sharpe</dt>
				<dd>{formatNumber(vault.three_months_sharpe, 1)}</dd>
			</div>
			<div>
				<dt>3M CAGR</dt>
				<dd>{formatPercentProfit(threeMonthCagr, 1)}</dd>
			</div>
		</dl>

		<div class="sparkline">
			<span class="metric-label">90-day performance</span>
			<div class="sparkline-chart">
				<VaultSparkline {vault} />
			</div>
		</div>
	</div>
</MetricsBox>

<style>
	:global(.position-vault-about) {
		--position-vault-about-font-size: 1rem;
	}

	:global(.metrics-box.position-vault-about h2) {
		font-size: var(--position-vault-about-font-size);
	}

	.about-content {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
		align-content: start;

		@media (--viewport-md-up) {
			grid-template-columns: minmax(0, 1fr) minmax(16rem, 20rem) minmax(12rem, 14rem);
			align-items: start;
			gap: clamp(1.5rem, 3vw, 3.5rem);
		}
	}

	.description {
		display: grid;
		gap: 0.75rem;
	}

	p {
		margin: 0;
		color: var(--c-text-light);
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--ls-ui-sm, normal);
		line-height: 1.5;
	}

	a {
		width: fit-content;
		justify-self: end;
		color: var(--c-link);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, normal);
		text-align: right;
		text-decoration: underline;
	}

	.sparkline {
		display: grid;
		gap: 0.5rem;
		justify-items: start;
		align-content: start;
	}

	.sparkline-chart {
		box-sizing: border-box;
		display: grid;
		width: 10rem;
		padding: 0.45rem;
		border: 1px solid var(--c-box-4);
		border-radius: var(--radius-sm);
		background: #000;

		--sparkline-width: 100%;
	}

	dl {
		display: grid;
		gap: 0.65rem;
		margin: 0;
	}

	@media (--viewport-md-up) {
		dl,
		.sparkline {
			align-self: stretch;
			padding-left: clamp(1.5rem, 2vw, 2.5rem);
			border-left: 1px solid var(--c-box-4);
		}
	}

	dl > div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	dt,
	dd {
		margin: 0;
	}

	dt,
	.metric-label {
		color: var(--c-text-light);
		font: var(--f-ui-md-medium);
		font-weight: bold;
		letter-spacing: var(--ls-ui-md, normal);
	}

	dd {
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
		letter-spacing: var(--ls-ui-md, normal);
		text-align: right;
	}

	p,
	a,
	dt,
	dd,
	.metric-label {
		font-size: var(--position-vault-about-font-size);
	}
</style>
