<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import { readable } from 'svelte/store';
	import { createTable } from 'svelte-headless-table';
	import { createRender } from '$lib/components/datatable/utils';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import BlockchainExplorerLink from './BlockchainExplorerLink.svelte';
	import TransactionStatus from './TransactionStatus.svelte';

	export let chain: Chain;
	export let transactions: Record<string, any>[] = [];

	const table = createTable(readable(transactions));

	const columns = table.createColumns([
		table.column({
			id: 'chain',
			header: 'Chain',
			accessor: ({ chain_id }) => chain.name ?? chain_id
		}),
		table.column({
			id: 'transaction_hash',
			header: 'Transaction hash',
			accessor: ({ tx_hash }) => tx_hash,
			cell: ({ value: tx_hash }) => createRender(BlockchainExplorerLink, { tx_hash, chain })
		}),
		table.column({
			id: 'status',
			header: 'Status',
			accessor: ({ status, revert_reason }) => ({ status, revert_reason }),
			cell: ({ value }) => createRender(TransactionStatus, value)
		})
	]);

	const tableViewModel = table.createViewModel(columns);
</script>

<section class="transaction-table">
	<h2>Transactions</h2>
	<DataTable size="sm" {tableViewModel} />
</section>

<style>
	.transaction-table {
		overflow-x: auto;
		overflow-y: hidden;

		h2 {
			margin-bottom: var(--space-md);
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}
		}

		:global(.status) {
			text-align: right;
		}
	}
</style>
