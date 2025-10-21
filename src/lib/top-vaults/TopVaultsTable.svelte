<script lang="ts">
	import type { TopVaults } from './client';
	import Alert from '$lib/components/Alert.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsRow from './TopVaultsRow.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	interface Props {
		topVaults: TopVaults;
	}

	const { topVaults }: Props = $props();
</script>

<div class="top-vaults-table">
	{#if !topVaults.rows.length}
		<Alert title="Error">No vault data available.</Alert>
	{:else}
		<div class="totals">
			<span>Total current TVL {formatDollar(topVaults.current_tvl_usd, 2, 2)}</span>
			<span>Peak TVL {formatDollar(topVaults.peak_tvl_usd, 2, 2)}</span>
			<span>Total vaults {topVaults.rows.length}</span>
			<span>Updated <Timestamp date={topVaults.generated_at} relative /></span>
		</div>

		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th></th>
						<th>Vault</th>
						<th>Chain</th>
						<th>Current TVL (USD)</th>
						<th>1M return (ann.)</th>
						<th>1M return</th>
						<th>3M return (ann.)</th>
						<th>3M return</th>
						<th>3M Sharpe</th>
						<th>3M volatility</th>
						<th>Lifetime return (ann.)</th>
						<th>Lifetime return</th>
						<th>Age (years)</th>
						<th>Denom-ination</th>
						<th>Peak TVL (USD)</th>
						<th>Deposits & Redeems</th>
						<th>Mgmt fee</th>
						<th>Perf fee</th>
						<th>First/Last deposit</th>
						<th>Vault address</th>
					</tr>
				</thead>
				<tbody>
					{#each topVaults.rows as vault, idx (vault.id)}
						<TopVaultsRow {vault} index={idx + 1} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.top-vaults-table {
		display: grid;
		gap: 1rem;

		.totals {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);
			margin-top: 1rem;
		}

		.table-wrapper {
			width: 100%;
			overflow-x: auto;
		}

		table {
			width: 100%;
			border-collapse: collapse;
			min-width: 75rem;
			background: var(--c-box-1);
			color: inherit;
			font: var(--f-mono-xs-regular);
			line-height: 1;
			letter-spacing: var(--f-text-md-spacing, normal);

			@media (--viewport-sm-down) {
				min-width: 64rem;
			}

			@media (--viewport-xs) {
				font-size: 14px;
			}

			:global(:is(td, th)) {
				padding: 0.25em 0.5em;
				border-block: 1px solid var(--c-text-ultra-light);
				vertical-align: top;
			}

			:global(td) {
				/* Alternating column colors */
				&:nth-child(even) {
					background-color: var(--c-box-3);
				}

				&:nth-child(odd) {
					background-color: var(--c-box-1);
				}
			}

			th {
				background: var(--c-box-3);
				font-weight: 900;
				text-transform: uppercase;
				text-align: left;
			}
		}
	}
</style>
