<script context="module">

	import { getConfiguredStrategiesWithMetadata } from 'trade-executor-frontend/strategy/metadata';

	export async function load({ fetch }) {
		let strategies = await getConfiguredStrategiesWithMetadata(fetch);

		// Laod metadata from all strategies
		return {
			props: {
				strategies
			}
		};
	}
</script>
<script>
    import StrategySummaryPage from "trade-executor-frontend/strategy/StrategySummaryPage.svelte";

    export let strategies;
</script>

<StrategySummaryPage {strategies} />