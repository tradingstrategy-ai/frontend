<!--
@component
Display an appropriate error message for a strategy when needed. There can be multiple failure modes for a trade executor
 - No connection - the webhook server is down / Internet issue
 - The trade executor has halted, the main loop aborted with an exception
 - The trade executor is not halted, but there is capital tied at frozen positions that need manual intervention

 #### Usage:
 ```svelte
   <StrategyStatus strategy={strategy} />
 ```
-->

<script context="module" lang="ts">
	import type { StrategyInfo } from 'trade-executor/models/strategy-info';

	export function adminOnlyError(strategy: StrategyInfo) {
		return strategy.connected && (!strategy.executor_running || strategy.frozen_positions > 0);
	}

	export function allUsersError(strategy: StrategyInfo) {
		return !strategy.connected;
	}

	export function shouldDisplayError(strategy: StrategyInfo, admin = false) {
		return allUsersError(strategy) || (admin && adminOnlyError(strategy));
	}
</script>

<script lang="ts">
	import { Timestamp } from '$lib/components';
	export let strategy: StrategyInfo;

	const baseUrl = `/strategies/${strategy.id}`;
</script>

{#if !strategy.connected}
	Trade executor offline. Cannot display the strategy statistics.
{:else if !strategy.executor_running}
	Strategy execution is currently paused due to an error. The trade execution engine is waiting for a manual action.
	{#if strategy.crashed_at}
		<Timestamp relative date={strategy.crashed_at}>
			{#snippet children({ relativeStr })}
				Strategy executor halted {relativeStr}.
			{/snippet}
		</Timestamp>
	{/if}
	<a href="{baseUrl}/tech-details/status"> See instance status page for more information </a>.
{:else if strategy.frozen_positions > 0}
	Strategy has currently frozen trading positions that require manual intervention.
	<a href="{baseUrl}/frozen-positions">See frozen positions page for more information</a>.
{/if}
