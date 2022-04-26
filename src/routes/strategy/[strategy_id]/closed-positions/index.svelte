<script lang="ts">
	import { portfolio, stats } from 'trade-executor-frontend/state/store';
	import PositionList from 'trade-executor-frontend/strategy/PositionList.svelte';

	$: closedPositions = $portfolio?.closed_positions;
</script>

<PositionList
	positions={closedPositions}
	columns={{ closed_at: true }}
	stats={$stats}
	pagination={true}
/>
