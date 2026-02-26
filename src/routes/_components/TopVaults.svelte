<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { isBlacklisted, meetsDefaultTvl, rankVaultsBy } from '$lib/top-vaults/helpers';
	import Section from '$lib/components/Section.svelte';
	import VaultItem from './VaultItem.svelte';

	interface Props {
		topVaults: TopVaults;
	}

	let { topVaults }: Props = $props();

	let vaults = $derived(
		topVaults.vaults
			.filter((vault) => !isBlacklisted(vault) && meetsDefaultTvl(vault))
			.sort(rankVaultsBy(['one_month_cagr', 'one_month_cagr_net']))
			.reverse()
			.slice(0, 5)
	);
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
