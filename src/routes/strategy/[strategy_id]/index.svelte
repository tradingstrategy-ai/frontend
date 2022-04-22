<script lang="ts">
	import StrategyMenu from 'trade-executor-frontend/strategy/StrategyMenu.svelte';
	import AssetOverview from 'trade-executor-frontend/strategy/AssetOverview.svelte';
	import PerformanceOverview from 'trade-executor-frontend/strategy/PerformanceOverview.svelte';
</script>

<div class="overview-card-wrapper">
	<AssetOverview />
</div>

<div class="overview-card-wrapper">
	<PerformanceOverview />
</div>

<div class="strategy-menu-mobile">
	<StrategyMenu />
</div>

<style>
	.strategy-menu-mobile {
		display: none;
	}

	@media (max-width: 992px) {
		.strategy-menu-mobile {
			display: block;
		}
	}

	.overview-card-wrapper {
		margin-bottom: 20px;
	}
</style>
