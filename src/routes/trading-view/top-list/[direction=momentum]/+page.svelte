<!--
	Daily winners and losers pages
-->
<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import MomentumTable from '$lib/momentum/MomentumTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data: PageData;
	$: up = data.direction === 'up';
</script>

<svelte:head>
	<title>DEX tokens with the highest daily {up ? 'profit' : 'losses'}</title>
	<meta name="description" content="Trading pairs with most {up ? 'profit' : 'volatile losses'} for the last 24h" />
</svelte:head>

<Breadcrumbs labels={{ 'top-list': 'Top lists', 'daily-up': 'Daily gainers', 'daily-down': 'Daily losers' }} />

<main>
	<Section header>
		<HeroBanner contentFullWidth title="Trading pairs with the most {up ? 'profit' : 'loss'} for the last 24h">
			<svelte:fragment slot="subtitle">
				<a class="body-link" href="/trading-view/trading-pairs">Trading pairs</a>
				with the highest ${up ? 'profit' : 'drawdown'} on
				<a class="body-link" href="/trading-view/exchanges">decentralised exchanges</a>
				today. Showing only the pairs with minimum $1M liquidity. All trading pairs are benchmarked against the US Dollar.
			</svelte:fragment>
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
