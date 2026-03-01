<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { isBlacklisted, meetsDefaultTvl, meetsMinTvl, rankVaultsBy } from '$lib/top-vaults/helpers';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import VaultItem from './VaultItem.svelte';
	import { resolve } from '$app/paths';
	import VaultSummaryMetrics from './VaultSummaryMetrics.svelte';

	interface Props {
		topVaults: TopVaults;
	}

	let { topVaults }: Props = $props();

	let baseVaults = $derived(topVaults.vaults.filter((vault) => !isBlacklisted(vault) && meetsMinTvl(vault)));

	let rankedVaults = $derived(
		baseVaults
			.filter(meetsDefaultTvl)
			.sort(rankVaultsBy(['one_month_cagr', 'one_month_cagr_net']))
			.reverse()
	);

	let chainCount = $derived(new Set(baseVaults.map((v) => v.chain_id)).size);
</script>

<Section padding="md" --section-background="var(--c-background-accent-1)">
	<h2>Top DeFi Vaults</h2>

	<div class="description ds-3">
		<span>The best-performing stablecoin vaults based on one month returns.</span>
	</div>

	<VaultSummaryMetrics {baseVaults} {rankedVaults} />

	<ul class="vaults ds-3">
		{#each rankedVaults.slice(0, 5) as vault (vault.id)}
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
