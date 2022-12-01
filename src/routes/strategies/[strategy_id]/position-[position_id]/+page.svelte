<script lang="ts">
	import DataBoxes from '$lib/components/DataBoxes.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import TradesTable from '$lib/components/TradesTable.svelte';

	export let data: PageData;

	const { positionId } = data;

	const items = [
		{
			label: 'Pair',
			value: 'ETH-SOL'
		},
		{
			label: 'Profitability',
			value: '▼ 0.7%'
		},
		{
			label: 'Quantity',
			value: '1 SOL'
		},
		{
			label: 'Opened',
			value: '2022-10-12 10:00'
		},
		{
			label: 'Value now',
			value: '$2.66'
		},
		{
			label: 'Value (highest)',
			value: '$22.00'
		}
	];
</script>

<main>
	<PageHeading
		class="ds-container"
		level={2}
		title={`<a href="/strategies/quickswap-momentum"><h1>QuickSwap Momentum</h1></a>`}
		subtitle="<h2>Position #{positionId}</h2>"
	/>
	<DataBoxes class="ds-container" {items} />
	<TradesTable class="ds-container" />
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
