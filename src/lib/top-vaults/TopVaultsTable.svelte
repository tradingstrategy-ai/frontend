<script lang="ts">
	import type { ApiChain } from '$lib/helpers/chain';
	import type { TopVaults } from './schemas';
	import Alert from '$lib/components/Alert.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsRow from './TopVaultsRow.svelte';

	interface Props {
		topVaults: TopVaults;
		chain?: ApiChain;
	}

	const { topVaults, chain }: Props = $props();
</script>

<div class="top-vaults-table">
	{#if !topVaults.vaults.length}
		<Alert title="Error">No vault data available.</Alert>
	{:else}
		<div class="table-meta">
			<span>{topVaults.vaults.length} {chain ? chain.chain_name : 'total'} vaults</span>
			<span>Updated <Timestamp date={topVaults.generated_at} relative /></span>
		</div>

		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th></th>
						<th>Vault</th>
						{#if !chain}
							<th>Chain</th>
						{/if}
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
					{#each topVaults.vaults as vault, idx (vault.id)}
						<TopVaultsRow {vault} index={idx + 1} {chain} />
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

		.table-meta {
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem;
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);
			margin-top: 1rem;

			> :not(:last-child)::after {
				content: '|';
				margin-left: 0.75rem;
			}
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
