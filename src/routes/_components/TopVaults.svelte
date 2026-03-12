<script lang="ts">
	import type { SlimVaultInfo, VaultAggregates } from '$lib/top-vaults/schemas';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import VaultItem from './VaultItem.svelte';
	import { resolve } from '$app/paths';
	import VaultSummaryMetrics from './VaultSummaryMetrics.svelte';

	interface Props {
		vaults: SlimVaultInfo[];
		aggregates: VaultAggregates;
	}

	let { vaults, aggregates }: Props = $props();
</script>

<Section padding="md" --section-background="var(--c-background-accent-1)">
	<h2>Top DeFi Vaults</h2>

	<div class="description ds-3">
		<span>The best-performing stablecoin vaults based on one month returns.</span>
	</div>

	<VaultSummaryMetrics {aggregates} />

	<ul class="vaults ds-3">
		{#each vaults.slice(0, 5) as vault (vault.id)}
			<VaultItem {vault} />
		{/each}
	</ul>

	<div class="cta">
		<Button secondary label="See all vaults" href={resolve('/trading-view/vaults')} />
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

	.vaults {
		list-style: none;
		margin-block: 2rem;
		margin-inline: auto;
		padding: 0;
		width: 100%;
		max-width: 50rem;
		display: grid;
		gap: 1.25rem;

		@media (--viewport-sm-down) {
			margin-top: 1rem;
			gap: 1rem;
		}
	}
</style>
