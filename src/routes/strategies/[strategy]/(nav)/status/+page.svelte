<!--
	Page to display the instance run-time status
-->
<script lang="ts">
	import { AlertList, AlertItem, DataBox, SummaryBox, Timestamp } from '$lib/components';

	export let data;
	$: ({ runState, state } = data);
</script>

<section class="instance-status">
	<div class="status-box">
		{#if runState.executor_running}
			<AlertList status="success">
				<AlertItem>Instance is running</AlertItem>
			</AlertList>
		{:else}
			<AlertList status="error">
				<AlertItem>Instance has stopped</AlertItem>
				<AlertItem displayWhen={runState.exception}>
					The trade executor crashed with an exception
					<pre>{runState.exception.exception_message}</pre>
				</AlertItem>
			</AlertList>
		{/if}
	</div>

	<div class="inner">
		<SummaryBox title="Current session" subtitle="Statistics since the trade executor instance was restarted">
			<DataBox label="Restarted" size="xs">
				<Timestamp date={runState.started_at} format="relative" />
			</DataBox>
			<DataBox label="Status last updated" size="xs">
				<Timestamp date={runState.last_refreshed_at} format="relative" />
			</DataBox>
			<DataBox label="Trading cycles" value={runState.cycles} size="xs" />
			<DataBox label="Take profit/stop loss checks" value={runState.position_trigger_checks} size="xs" />
			<DataBox label="Position revaluations" value={runState.position_revaluations} size="xs" />
		</SummaryBox>

		<SummaryBox title="Lifetime" subtitle="Overall execution metrics">
			<DataBox label="Completed trading cycles" value={`${(state.cycle || 0) - 1}`} size="xs" />
			<DataBox label="First started" size="xs">
				<Timestamp date={state.created_at} format="iso" withTime />
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
		& .inner {
			display: grid;
			gap: var(--space-lg);
			place-content: stretch;
			place-items: stretch;

			@media (--viewport-md-down) {
				gap: var(--space-ls);
			}
		}

		& .inner {
			grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		}
	}

	.status-box pre {
		color: inherit;
		white-space: pre-wrap;
	}
</style>
