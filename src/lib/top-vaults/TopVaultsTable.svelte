<script lang="ts">
	import type { TopVaults } from './client';
	import TopVaultsRow from './TopVaultsRow.svelte';

	interface Props {
		topVaults: TopVaults;
	}

	const { topVaults }: Props = $props();
</script>

<div class="top-vaults-table">
	<table>
		<thead>
			<tr>
				<th>Vault</th>
				<th>Chain</th>
				<th>1M return</th>
				<th>1M return (ann.)</th>
				<th>3M return (ann.)</th>
				<th>3M Sharpe</th>
				<th>Lifetime return (ann.)</th>
				<th>Current TVL (USD)</th>
				<th>Age (years)</th>
				<th>Denomination</th>
				<th>Peak TVL (USD)</th>
				<th>3M return</th>
				<th>Lifetime return</th>
				<th>3M volatility</th>
				<th>Deposits/Redeems</th>
				<th>Mgmt fee</th>
				<th>Perf fee</th>
				<th>First deposit</th>
				<th>Last deposit</th>
				<th>Vault address</th>
				<th>Vault ID</th>
			</tr>
		</thead>
		<tbody>
			{#each topVaults.rows as vault (vault.id)}
				<TopVaultsRow {vault} />
			{/each}
		</tbody>
	</table>
</div>

<style>
	.top-vaults-table :global {
		width: 100%;
		overflow-x: auto;

		table {
			width: 100%;
			border-collapse: collapse;
			min-width: 1200px;

			@media (--viewport-sm-down) {
				min-width: 1024px;
			}
		}

		th,
		td {
			text-align: left;
			padding: 0.75rem 1rem;
			border-bottom: 1px solid var(--c-box-4);
			vertical-align: top;
		}

		th {
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--ls-ui-xs);
			text-transform: uppercase;
			color: var(--c-text-light);
			background: color-mix(in srgb, var(--c-box-1), var(--c-box-2) 40%);
			position: sticky;
			top: 0;
		}

		td {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--ls-ui-sm, normal);
		}

		tr:nth-child(even) td {
			background: color-mix(in srgb, var(--c-box-1), var(--c-box-2) 20%);
		}

		.vault-name {
			display: grid;
			gap: 0.25rem;
		}

		.protocol {
			font: var(--f-ui-xs-medium);
			letter-spacing: 0.02em;
			color: var(--c-text-light);
			text-transform: uppercase;
		}

		.chain-link {
			color: inherit;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}

		.address-cell,
		.id-cell {
			font-family: var(
				--monospace,
				ui-monospace,
				SFMono-Regular,
				SFMono,
				Menlo,
				Monaco,
				Consolas,
				'Liberation Mono',
				'Courier New',
				monospace
			);
		}
	}
</style>
