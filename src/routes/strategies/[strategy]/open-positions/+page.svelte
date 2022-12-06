<script lang="ts">
	import type { PageData } from './$types';
	import PositionTable from '../PositionTable.svelte';

	export let data: PageData;

	$: summary = data.summary;

	const positions = [
		{
			position_id: 209,
			ticker: 'ETH-SOL',
			profitability: 0.0065,
			value: 123.45,
			opened_at: 1670032800
		},
		{
			position_id: 222,
			ticker: 'ETH-USDC',
			profitability: -0.0123,
			value: -67.89,
			opened_at: 1670057543
		}
	];
</script>

<section>
	<PositionTable strategyId={summary.id} {positions} />
</section>

<style lang="postcss">
	section {
		padding: 1rem 0 0;
	}
</style>
