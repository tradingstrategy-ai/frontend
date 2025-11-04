<!--
	Page to display the instance run-time status
-->
<script lang="ts">
	import { Alert, HashAddress, Timestamp, Tooltip } from '$lib/components';
	import IconWarning from '~icons/local/warning';
	import { formatAmount, formatNumber } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';

	export let data;
	$: ({ runState, deferred, strategy, chain } = data);
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
			<tr>
				<td>Hot wallet address</td>
				<td>
					{#if runState.hot_wallet_address}
						<a class="hot-wallet" href={getExplorerUrl(chain, runState.hot_wallet_address)} target="_blank">
							<HashAddress address={runState.hot_wallet_address} />
						</a>
					{:else}
						---
					{/if}
				</td>
			</tr>
			<tr>
				<td>Hot wallet gas balance</td>
				<td>
					{#if runState.hot_wallet_gas >= runState.hot_wallet_gas_warning_level}
						{formatNumber(runState.hot_wallet_gas, 2, 4)}
						{chain.nativeCurrency}
					{:else}
						<Tooltip>
							<span slot="trigger" class="gas-warning">
								<span class="underline">
									{formatNumber(runState.hot_wallet_gas, 2, 4)}
									{chain.nativeCurrency}
								</span>
								<IconWarning />
							</span>
							<svelte:fragment slot="popup">
								{#if runState.hot_wallet_gas_warning_message}
									{runState.hot_wallet_gas_warning_message}
								{:else}
									Hot wallet balance is below the warning level of {formatNumber(runState.hot_wallet_gas_warning_level)}
									{chain.nativeCurrency}
								{/if}
							</svelte:fragment>
						</Tooltip>
					{/if}
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

	@media (--viewport-md-up) {
		.metrics-table {
			position: relative;

			:global(.tooltip .popup) {
				right: 0;
				max-width: 40ch;
			}
		}
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

	.hot-wallet {
		display: inline-grid;
		border-bottom: 1px solid currentColor;

		&:hover {
			font-weight: 500;
		}
	}

	.gas-warning {
		color: var(--c-error);
		font-weight: 500;
	}
</style>
