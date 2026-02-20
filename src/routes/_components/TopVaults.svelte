<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import Section from '$lib/components/Section.svelte';
	import VaultItem from './VaultItem.svelte';

	interface Props {
		topVaults: TopVaults;
	}

	let { topVaults }: Props = $props();

	const HYPERCORE_CHAIN_ID = 9999;
	const TVL_THRESHOLD_DEFAULT = 50_000;
	const TVL_THRESHOLD_HYPERCORE = 1_000_000;

	let vaults = $derived.by(() => {
		return topVaults.vaults
			.filter((vault) => {
				const threshold = vault.chain_id === HYPERCORE_CHAIN_ID ? TVL_THRESHOLD_HYPERCORE : TVL_THRESHOLD_DEFAULT;
				return (vault.current_nav ?? 0) >= threshold;
			})
			.filter((vault) => !isBlacklisted(vault))
			.sort((a, b) => {
				const cagrA = a.one_month_cagr_net ?? a.one_month_cagr ?? 0;
				const cagrB = b.one_month_cagr_net ?? b.one_month_cagr ?? 0;
				return cagrB - cagrA;
			})
			.slice(0, 5);
	});
</script>

<Section padding="md" --section-background="var(--c-background-accent-1)">
	<h2>Top DeFi Vaults</h2>

	<ul class="vaults ds-3">
		{#each vaults as vault (vault.id)}
			<VaultItem {vault} />
		{/each}
	</ul>
</Section>

<style>
	h2 {
		text-align: center;
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
	}
</style>
