<!--
	Page to display the instance run-time status
-->
<script lang="ts">
	import { Alert, DataBox, SummaryBox, Timestamp } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters';

	export let data;
	$: ({ runState, deferred } = data);
</script>

<section class="instance-status">
	<div class="status-box">
		{#if runState.executor_running}
			<Alert size="md" status="success">Instance is running</Alert>
		{:else}
			<Alert size="md" status="error">
				Instance has stopped
				{#if runState.exception}
					with an exception
					<pre>{runState.exception.exception_message}</pre>
				{/if}
			</Alert>
		{/if}
	</div>

	<div class="inner">
		<SummaryBox title="Current session" subtitle="Statistics since the trade executor instance was restarted">
			<DataBox label="Restarted" size="xs">
				<Timestamp date={runState.started_at} relative />
			</DataBox>
			<DataBox label="Status last updated" size="xs">
				<Timestamp date={runState.last_refreshed_at} relative />
			</DataBox>
			<DataBox label="Trading cycles" value={runState.cycles} size="xs" />
			<DataBox label="Take profit/stop loss checks" value={runState.position_trigger_checks} size="xs" />
			<DataBox label="Position revaluations" value={runState.position_revaluations} size="xs" />
		</SummaryBox>

		<SummaryBox title="Lifetime" subtitle="Overall execution metrics">
			<DataBox label="Completed trading cycles" size="xs" --skeleton-width="5rem">
				{#await deferred.state}
					<span class="skeleton">---</span>
				{:then state}
					{state ? formatAmount(state.cycle - 1) : '---'}
				{/await}
			</DataBox>
			<DataBox label="First started" size="xs" --skeleton-width="12rem">
				{#await deferred.state}
					<span class="skeleton">---</span>
				{:then state}
					{#if state}
						<Timestamp date={state.created_at} withTime /> UTC
					{:else}
						---
					{/if}
				{/await}
			</DataBox>
		</SummaryBox>
	</div>

	<SummaryBox title="Version" subtitle="Current software version">
		<DataBox label="Version" value={runState.version.tag} size="xs" />
		<DataBox label="Commit hash" value={runState.version.commit_hash} size="xs" />
		<DataBox label="Last commit message" value={runState.version.commit_message} size="xs" />
	</SummaryBox>
</section>

<style lang="postcss">
	.instance-status {
		&,
		.inner {
			display: grid;
			gap: var(--space-lg);
			place-content: stretch;
			place-items: stretch;

			@media (--viewport-md-down) {
				gap: var(--space-ls);
			}
		}

		.inner {
			grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		}
	}

	.status-box pre {
		color: inherit;
		white-space: pre-wrap;
	}
</style>
