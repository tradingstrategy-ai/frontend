<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import SocialMediaTags from './SocialMetaTags.svelte';
	import VaultPageHeader from './VaultPageHeader.svelte';
	import ChartWithFeaturedMetrics from './ChartWithFeaturedMetrics.svelte';
	import VaultMetrics from './VaultMetrics.svelte';
	import { isBlacklisted } from '$lib/top-vaults/helpers';

	let { data } = $props();
	let { vault, chain } = $derived(data);
</script>

<SocialMediaTags {vault} {chain} />

<Breadcrumbs labels={{ [chain.slug]: chain.name, vaults: 'Top Vaults', [vault.vault_slug]: vault.name }} />

<main class="vault-details ds-3">
	<VaultPageHeader {vault} {chain} />

	<Section padding="md" --section-gap="var(--gap)">
		{#if isBlacklisted(vault)}
			<Alert size="md" title="Blacklisted">
				{vault.notes ?? 'Unknown reason'}
			</Alert>
		{/if}

		<ChartWithFeaturedMetrics {vault} />

		<VaultMetrics {vault} />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.vault-details {
		:global(:is(.desktop, .mobile)) {
			display: contents;
		}

		@media (--viewport-sm-down) {
			--padding: 1.25rem;
			--gap: 1.5rem;

			:global(.desktop) {
				display: none;
			}
		}

		@media (--viewport-md-up) {
			--padding: 1.75rem;
			--gap: 2rem;

			:global(.mobile) {
				display: none;
			}
		}
	}
</style>
