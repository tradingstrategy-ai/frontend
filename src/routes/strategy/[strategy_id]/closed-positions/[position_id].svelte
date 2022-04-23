<script lang="ts">
	import PositionDetailsPage from 'trade-executor-frontend/strategy/PositionDetailsPage.svelte';
	import { PositionKind } from 'trade-executor-frontend/state/interface';
</script>

<PositionDetailsPage positionKind={PositionKind.closed} />
