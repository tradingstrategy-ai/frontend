<script lang="ts">
	import TradeDetailsPage from 'trade-executor-frontend/strategy/TradeDetailsPage.svelte';
	import { PositionKind } from 'trade-executor-frontend/state/interface';
</script>

<TradeDetailsPage positionKind={PositionKind.open} />
