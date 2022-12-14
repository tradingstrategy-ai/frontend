<!--
	Page to display the instance run-time status

	TODO: Convert from tables to <SummaryBox> or <DataBoxes>?
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { formatSince, formatUnixTimestamp } from '$lib/helpers/formatters.js';
	import { AlertList, AlertItem, DataBox, SummaryBox } from '$lib/components';

	export let data: PageData;

	// Current run state
	$: runState = data.runState;

	// The whole strategy state
	$: state = data.state;
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
			</AlertList>

			{#if runState.exception}
				<AlertList>
					<AlertItem>The trade executor crashed with an exception</AlertItem>
				</AlertList>

				<pre>{runState.exception.exception_message}</pre>
			{/if}
		{/if}
	</div>

	<div class="inner">
		<SummaryBox title="Current session" subtitle="Statistics since the trade executor instance was restarted">
			<DataBox label="Restarted" value={formatSince(runState.started_at)} size="xs" />
			<DataBox label="Status last updated" value={formatSince(runState.last_refreshed_at)} size="xs" />
			<DataBox label="Trading cycles" value={formatSince(runState.cycles)} size="xs" />
			<DataBox label="Take profit/stop loss checks" value={formatSince(runState.position_trigger_checks)} size="xs" />
			<DataBox label="Position revaluations" value={formatSince(runState.position_revaluations)} size="xs" />
		</SummaryBox>

		<SummaryBox title="Lifetime" subtitle="Overall execution metrics">
			<DataBox label="Completed trading cycles" value={`${(state.cycle || 0) - 1}`} size="xs" />
			<DataBox label="First started" value={formatUnixTimestamp(state.created_at)} size="xs" />
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
			gap: 1.5rem;
			place-content: stretch;
			place-items: stretch;
		}

		& .inner {
			grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		}
	}

	.up-icon {
		font-size: 150%;
		margin: 10px;
	}

	.up-text {
		font-weight: bold;
	}

	h2 {
		margin-block: 2rem 1rem;
	}

	table {
		margin: 20px 0;
	}

	td {
		padding: 10px;
	}
</style>
