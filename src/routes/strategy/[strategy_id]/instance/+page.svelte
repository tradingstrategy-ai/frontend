<!--

    Page to display the instance run-time status

    TODO: Convert tables to <SummaryBox>

-->
<script lang="ts">
	import type { PageData } from './$types';
	import { formatSince, formatUnixTimestamp } from '$lib/helpers/formatters.js';
	import { currentStrategy } from 'trade-executor-frontend/state/store';
	import { AlertList, AlertItem } from '$lib/components';

	export let data: PageData;

	// Current run state
	$: runState = data.runState;

	// The whole strategy state
	$: state = $currentStrategy.state || {};
</script>

{#if runState.executor_running}
	<div class="instance-status">
		<span class="up-icon">🟢</span> <span class="up-text">Instance running</span>
	</div>
{:else}
	<div class="instance-status">
		<span class="up-icon">🔴</span> <span class="up-text">Instance stopped</span>
	</div>

	{#if runState.exception}
		<AlertList>
			<AlertItem>The trade executor crashed with an exception</AlertItem>
		</AlertList>

		<pre>{runState.exception.exception_message}</pre>
	{/if}
{/if}

<h2>Current session</h2>

<p>Statistics since the trade executor instance was restarted.</p>

<table>
	<tr>
		<th>Restarted</th>
		<td>{formatSince(runState.started_at)}</td>
	</tr>

	<tr>
		<th>Status last updated</th>
		<td>{formatSince(runState.last_refreshed_at)}</td>
	</tr>

	<tr>
		<th>Trading cycles</th>
		<td>{runState.cycles}</td>
	</tr>

	<tr>
		<th>Take profit/stop loss checks</th>
		<td>{runState.position_trigger_checks}</td>
	</tr>

	<tr>
		<th>Position revaluations</th>
		<td>{runState.position_revaluations}</td>
	</tr>
</table>

<h2>Lifetime</h2>

<p>Overall execution metrics.</p>

<table>
	<tr>
		<th>Completed trading cycles</th>
		<td>{(state.cycle || 0) - 1}</td>
	</tr>

	<tr>
		<th>First started</th>
		<td>{formatUnixTimestamp(state.created_at)}</td>
	</tr>
</table>

<h2>Version</h2>

<p>Current software version.</p>

<table>
	<tr>
		<th>Version</th>
		<td>{runState.version.tag}</td>
	</tr>

	<tr>
		<th>Commit hash</th>
		<td>{runState.version.commit_hash}</td>
	</tr>

	<tr>
		<th>Last commit message</th>
		<td>{runState.version.commit_message}</td>
	</tr>
</table>

<style>
	.instance-status {
		display: flex;
		align-items: center;
	}

	.up-icon {
		font-size: 150%;
		margin: 10px;
	}

	.up-text {
		font-weight: bold;
	}

	table {
		margin: 20px 0;
	}

	td {
		padding: 10px;
	}
</style>
