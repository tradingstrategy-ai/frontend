<!--
	Daily winners and losers pages
-->
<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import MomentumTable from '$lib/content/MomentumTable.svelte';

	export let data: PageData;
	$: up = data.direction === 'up';
</script>

<svelte:head>
	<title>DEX tokens with the highest daily {up ? 'profit' : 'losses'}</title>
	<meta name="description" content="Trading pairs with most {up ? 'profit' : 'volatile losses'} for the last 24h" />
</svelte:head>

<Breadcrumbs labels={{ 'top-list': 'Top lists', 'daily-up': 'Daily gainers', 'daily-down': 'Daily losers' }} />

<main>
	<header class="ds-container">
		<h1>Trading pairs with the most {up ? 'profit' : 'loss'} for the last 24h</h1>

		<p>
			<a class="body-link" href="/trading-view/trading-pairs">Trading pairs</a>
			with the highest {up ? 'profit' : 'drawdown'} on
			<a class="body-link" href="/trading-view/exchanges">decentralised exchanges</a>
			today. Showing only the pairs with minimum $1M liquidity. All trading pairs are benchmarked against the US Dollar.
		</p>
	</header>

	<section class="ds-container">
		<MomentumTable pairs={data.pairs} kind="price" />
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-xl);
	}

	header {
		gap: var(--space-xl);
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	header p {
		font: var(--f-ui-large-roman);
	}
</style>
