<!--
	Page to display the instance run-time status
-->
<script lang="ts">
	import { Alert, Timestamp, Tooltip } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters';

	export let data;
	$: ({ runState, deferred, strategy } = data);
</script>

<svelte:head>
	<title>Instance status | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Instance status information for {strategy.name} strategy" />
</svelte:head>

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

	<table class="metrics-table">
		<thead>
			<tr>
				<th>Status metric</th>
				<th>Value</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Status last updated</td>
				<td><Timestamp date={runState.last_refreshed_at} relative /></td>
			</tr>
			<tr>
				<td>Last restarted</td>
				<td><Timestamp date={runState.started_at} relative /></td>
			</tr>
			<tr>
				<td>First started</td>
				<td>
					{#await deferred.state}
						<span class="skeleton">---</span>
					{:then state}
						{#if state}
							<Timestamp date={state.created_at} withTime /> UTC
						{:else}
							---
						{/if}
					{/await}
				</td>
			</tr>
			<tr>
				<td>Trading cycles since restart</td>
				<td>{formatAmount(runState.cycles)}</td>
			</tr>
			<tr>
				<td>Total trading cycles</td>
				<td>{formatAmount(runState.completed_cycle)}</td>
			</tr>
			<tr>
				<td>Take profit/stop loss checks</td>
				<td>{formatAmount(runState.position_trigger_checks)}</td>
			</tr>
			<tr>
				<td>Position reevaluations</td>
				<td>{formatAmount(runState.position_revaluations)}</td>
			</tr>
			<tr>
				<td>Version</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							{runState.version.tag}
						</span>
						<div slot="popup" class="commit">
							<div class="hash">commit: {runState.version.commit_hash}</div>
							<div class="message">{runState.version.commit_message}</div>
						</div>
					</Tooltip>
				</td>
			</tr>
		</tbody>
	</table>
</section>

<style>
	.instance-status {
		display: grid;
		gap: var(--space-lg);

		@media (--viewport-md-down) {
			gap: var(--space-ls);
		}
	}

	.status-box pre {
		color: inherit;
		white-space: pre-wrap;
	}

	.commit {
		display: grid;
		gap: 0.75em;

		.hash {
			color: var(--c-text-extra-light);
			font-weight: 500;
		}

		.message {
			font: var(--f-paragraph-md-roman);
			letter-spacing: var(--ls-paragraph-md);
		}
	}
</style>
