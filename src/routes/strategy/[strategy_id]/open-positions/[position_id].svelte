<script lang="ts">
	import PositionDetails from 'trade-executor-frontend/strategy/PositionDetails.svelte';
	import { PositionKind } from 'trade-executor-frontend/state/interface';
</script>

<PositionDetails positionKind={PositionKind.open} />
