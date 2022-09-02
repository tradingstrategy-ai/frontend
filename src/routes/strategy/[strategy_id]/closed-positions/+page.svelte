<script lang="ts">
	import { portfolio, stats } from 'trade-executor-frontend/state/store';
	import { PositionList } from 'trade-executor-frontend';

	$: closedPositions = $portfolio?.closed_positions;
</script>

<PositionList
	positions={closedPositions}
	columns={{ closed_at: true, profitability: true, value_for_close: true }}
	stats={$stats}
	pagination={true}
	search={true}
/>
