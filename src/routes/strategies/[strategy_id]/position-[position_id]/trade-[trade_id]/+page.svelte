<script lang="ts">
	import DataBoxes from '$lib/components/DataBoxes.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import TransactionsTable from '$lib/components/TransactionsTable.svelte';

	export let data: PageData;

	const { positionId, tradeId } = data;

	const items = [
		{
			label: 'Pair',
			value: 'ETH-SOL'
		},
		{
			label: 'Executed at',
			value: '2022-10-12 10:00'
		},
		{
			label: 'Slippage tolerance',
			value: '20 BPS'
		},
		{
			label: 'Expected value',
			value: '$2.66'
		},
		{
			label: 'Realised value',
			value: '$2.66'
		},
		{
			label: 'Liquidity provide fees',
			value: 'N/A'
		},
		{
			label: 'Expected quantity',
			value: '0.667867633366685238 USDC'
		},
		{
			label: 'Realised quantity',
			value: '0.667867633366685238 USDC'
		},
		{
			label: 'Gas fees',
			value: 'N/A'
		}
	];
</script>

<main>
	<PageHeading
		class="ds-container"
		level={2}
		title={`<a href="/strategies/quickswap-momentum/position-420"><h1>Position #${positionId} in Quickswap Momentum</h1></a>`}
		subtitle="<h2>Trade #{tradeId}</h2>"
	/>
	<DataBoxes class="ds-container" {items} />
	<TransactionsTable class="ds-container" />
</main>

<style>
	main :global(.data-boxes) {
		margin: 1rem 0 3rem;
	}

	@media all and (max-width: 767px) {
		main :global(.data-boxes) {
			margin: 0 0 2rem;
		}
	}
</style>
