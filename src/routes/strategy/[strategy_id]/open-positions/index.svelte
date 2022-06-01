<script lang="ts">
	import { portfolio, stats } from 'trade-executor-frontend/state/store';
	import PositionList from 'trade-executor-frontend/strategy/PositionList.svelte';

	$: openPositions = $portfolio?.open_positions;
</script>

<PositionList
	positions={openPositions}
	stats={$stats}
	columns={{ opened_at: true, value: true, profitability: true }}
	pagination={false}
/>
