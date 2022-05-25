<script context="module">
	import StrategyOverviewPage from 'trade-executor-frontend/strategy/StrategyOverviewPage.svelte';
	import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';
	import { getStrategyMetadata } from 'trade-executor-frontend/strategy/metadata';

	// Load strategy specific metadata that is used in the overview
	export async function load({ params, fetch }) {
		const strategy = getConfiguredStrategyById(params.strategy_id);
		const metadata = await getStrategyMetadata(strategy, fetch);

		return {
			props: {
				metadata
			}
		};
	}
</script>

<script lang="ts">
	export let metadata;
</script>

<StrategyOverviewPage {metadata} />
