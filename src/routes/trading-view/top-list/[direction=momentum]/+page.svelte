<!--
	Daily winners and losers pages
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import MomentumTable from '$lib/momentum/MomentumTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	let { data } = $props();
	let up = $derived(data.direction === 'up');
</script>

<MetaTags
	titleParts={[`DEX tokens with the highest daily ${up ? 'gains' : 'losses'}`, 'Top list']}
	description={`Decentralised exchange trading pairs with the biggest ${up ? 'price gains' : 'price losses'} over the last 24 hours, updated daily from on-chain data.`}
/>

<Breadcrumbs labels={{ 'top-list': 'Top lists', 'daily-up': 'Daily gainers', 'daily-down': 'Daily losers' }} />

<main>
	<Section tag="header">
		<HeroBanner title="Trading pairs with the most {up ? 'profit' : 'loss'} for the last 24h">
			{#snippet subtitle()}
				<a class="body-link" href={resolve('/trading-view/trading-pairs')}>Trading pairs</a>
				with the highest {up ? 'profit' : 'drawdown'} on
				<a class="body-link" href={resolve('/trading-view/exchanges')}>decentralised exchanges</a>
				today. Showing only the pairs with minimum $1M liquidity. All trading pairs are benchmarked against the US Dollar.
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<MomentumTable pairs={data.pairs} />
	</Section>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-xl);
	}
</style>
