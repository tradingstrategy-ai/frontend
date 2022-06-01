<script lang="ts">
	import { portfolio, stats } from 'trade-executor-frontend/state/store';
	import PositionList from 'trade-executor-frontend/strategy/PositionList.svelte';

	$: frozenPositions = $portfolio?.frozen_positions;
</script>

<div class="alert alert-info">
	The frozen positions could not be automatically open or closed, usually due to a problem with related
	tokens or blockchains. The profitabitility cannot be established for the same reason.
    Manual intervention maybe needed.
</div>

<PositionList
	positions={frozenPositions}
	stats={$stats}
	columns={{ opened_at: false, freeze_status: true, details: false, value: true }}
	pagination={false}
/>
