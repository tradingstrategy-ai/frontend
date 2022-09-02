<!--

- Render strategy menu and heading

- Toggle strategy state loading on mount

-->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import { loadStrategyById } from 'trade-executor-frontend/state/store';
	import { StrategyHeader, StrategyLoadIndicator, StrategyMenu } from 'trade-executor-frontend';

	const strategyId = $page.params.strategy_id;

	// All pages within this layout refer to the same strategy.
	// Toggle its load as soon as layout mounts.
	onMount(async () => {
		await loadStrategyById(strategyId);
	});
</script>

<div class="container">
	<div class="row">
		<div class="col-md-3 col-strategy-menu">
			<div class="strategy-menu-sidebar">
				<StrategyMenu />
			</div>
		</div>
		<div class="col-md-9">
			<StrategyLoadIndicator />
			<StrategyHeader />
			<slot />
		</div>
	</div>
</div>

<style>
	@media (max-width: 992px) {
		.col-strategy-menu {
			display: none;
		}
	}
</style>
