<script lang="ts">
	import type { TopVaults } from './schemas';
	import { type ApiChain, getChain, getExplorerUrl } from '$lib/helpers/chain';
	import Alert from '$lib/components/Alert.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import DataTable from '$lib/components/datatable/DataTable.svelte';
	import TopVaultsOptIn from './TopVaultsOptIn.svelte';
	import ChainCell from './ChainCell.svelte';
	import VaultCell from './VaultCell.svelte';
	import FeesCell from './FeesCell.svelte';
	import LastDepositCell from './LastDepositCell.svelte';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addSortBy, addHiddenColumns, addTableFilter } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { formatAmount, formatDollar, formatNumber, formatPercent, formatValue } from '$lib/helpers/formatters';

	interface Props {
		topVaults: TopVaults;
		apiChain?: ApiChain;
	}

	const { topVaults, apiChain }: Props = $props();

	const vaultsStore = readable(topVaults.vaults);

	const table = createTable(vaultsStore, {
		hide: addHiddenColumns({ initialHiddenColumnIds: apiChain ? ['chain'] : [] }),
		sort: addSortBy({
			initialSortKeys: [{ id: 'return_ann_1m', order: 'desc' }],
			toggleOrder: ['desc', 'asc']
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())
		})
	});

	const tableColumns = table.createColumns([
		table.display({
			id: 'index',
			header: '',
			// Cell is populated with row index via CSS counters; see `rowNumber` below
			cell: () => ''
		}),
		table.column({
			id: 'chain',
			header: '',
			accessor: ({ chain: chainId }) => {
				const chain = getChain(chainId);
				return { chainId, chain, label: chain?.name ?? `Chain ${chainId}` };
			},
			cell: ({ value }) => createRender(ChainCell, value),
			plugins: {
				sort: {
					getSortValue: ({ label }) => label,
					invert: true
				},
				filter: {
					getFilterValue: ({ chainId, chain }) => `${chainId} ${chain?.name}`
				}
			}
		}),
		table.column({
			id: 'vault',
			header: 'Vault',
			accessor: ({ name, protocol }) => ({ name, protocol }),
			cell: ({ value }) => createRender(VaultCell, value),
			plugins: {
				sort: {
					getSortValue: ({ name }) => name.toLowerCase(),
					invert: true
				},
				filter: {
					getFilterValue: ({ name, protocol }) => `${name} ${protocol}`
				}
			}
		}),
		table.column({
			accessor: 'current_tvl_usd',
			header: 'Current TVL (USD)',
			cell: ({ value }) => formatDollar(value, 2, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'return_ann_1m',
			accessor: '1m_return_ann',
			header: '1M return (ann.)',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'return_1m',
			accessor: '1m_return',
			header: '1M return',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'return_ann_3m',
			accessor: '3m_return_ann',
			header: '3M return (ann.)',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'return_3m',
			accessor: '3m_return',
			header: '3M return',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'sharpe_3m',
			accessor: '3m_sharpe',
			header: '3M Sharpe',
			cell: ({ value }) => formatNumber(value, 1),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'volatility_3m',
			accessor: '3m_volatility',
			header: '3M vola-tility',
			cell: ({ value }) => formatPercent(value),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'lifetime_return_ann',
			header: 'Lifetime return (ann.)',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'lifetime_return',
			header: 'Lifetime return',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'age_years',
			header: 'Age (years)',
			cell: ({ value }) => formatNumber(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			header: 'Last deposit',
			accessor: 'last_deposit',
			cell: ({ value }) => createRender(LastDepositCell, { last_deposit: value }),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'denomination',
			header: 'Denom-ination',
			cell: ({ value }) => formatValue(value),
			plugins: { sort: { invert: true } }
		}),
		table.column({
			accessor: 'peak_tvl_usd',
			header: 'Peak TVL (USD)',
			cell: ({ value }) => formatDollar(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'deposit_redeem_count',
			header: 'Deposits & Redeems', // NOTE: non-breaking space after "&"
			cell: ({ value }) => formatAmount(value),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'fees',
			header: 'Fees',
			accessor: ({ management_fee, performance_fee }) => ({ management_fee, performance_fee }),
			cell: ({ value }) => createRender(FeesCell, value),
			plugins: {
				sort: {
					getSortValue: (v) => (v.management_fee ?? 0) + (v.performance_fee ?? 0),
					invert: true
				},
				filter: { exclude: true }
			}
		}),
		table.column({
			id: 'address',
			header: 'Vault address',
			accessor: ({ address, chain: chainId }) => ({ address, chainId }),
			cell: ({ value: { address, chainId } }) =>
				createRender(CryptoAddressWidget, {
					class: 'vault-address',
					size: 'sm',
					address,
					href: getExplorerUrl(getChain(chainId), address)
				}),
			plugins: {
				sort: { disable: true },
				filter: {
					getFilterValue: ({ address }) => address
				}
			}
		})
	]);

	const tableViewModel = table.createViewModel(tableColumns);
	const { pluginStates } = tableViewModel;
	const filterValue = pluginStates.filter.filterValue;
</script>

<div class="top-vaults">
	<TopVaultsOptIn />

	{#if !topVaults.vaults.length}
		<Alert title="Error">No vault data available.</Alert>
	{:else}
		<div class="table-extras">
			<div class="table-meta">
				<span>{topVaults.vaults.length} {apiChain ? apiChain.chain_name : 'total'} vaults</span>
				<span>Updated <Timestamp date={topVaults.generated_at} relative /></span>
			</div>
			<TextInput bind:value={$filterValue} type="search" placeholder="Search vaults" />
		</div>

		<div class="table-wrapper">
			<DataTable class="top-vaults-table" {tableViewModel} />
		</div>
	{/if}
</div>

<style>
	.top-vaults {
		display: grid;
		gap: 1rem;

		.table-extras {
			display: grid;
			grid-template-columns: 1fr 24rem;
			gap: 1rem;
			align-items: center;
			margin-top: 1rem;
			--text-input-width: 100%;

			@media (--viewport-sm-down) {
				grid-template-columns: 1fr;
			}
		}

		.table-meta {
			display: flex;
			gap: 0.75rem;
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);

			> :not(:last-child)::after {
				content: '|';
				margin-left: 0.75rem;
			}
		}

		.table-wrapper {
			width: 100%;

			/*
				Setting overflow:auto breaks the sticky header, but is needed to allow horizontal scrolling
				on smaller viewports. Best compromise is to only set overflow on smaller viewports.
			 */
			@media (--viewport-xl-down) {
				overflow-x: auto;
			}
		}

		:global(.top-vaults-table) {
			position: relative;
			width: 100%;
			border-collapse: collapse;
			min-width: 75rem;
			color: inherit;
			font: var(--f-mono-xs-regular);
			line-height: 1;
			letter-spacing: var(--f-text-md-spacing, normal);
			counter-reset: rowNumber;

			@media (--viewport-sm-down) {
				min-width: 64rem;
			}

			@media (--viewport-xs) {
				font-size: 14px;
			}

			:global(:is(td, th)) {
				vertical-align: top;
			}

			:global(th) {
				position: sticky;
				top: 0px;
				z-index: 1;
				/* sticky header background must be solid (no transparency) */
				background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-4-alpha));
				/* sticky header border gets lost on scroll, so use box-shadow instead */
				box-shadow: inset 0px -2px var(--c-text-extra-light);
				padding: 0.5rem;
				/* add extra padding to bottom to account for the inset box-shadow */
				padding-bottom: calc(0.5rem + 2px);
				font-weight: 900;
				text-transform: uppercase;
				text-align: left;
			}

			:global(th.sorted) {
				padding-right: 1.125rem;

				:global(svg) {
					position: absolute;
					top: 0.5rem;
					right: 0.25rem;
				}
			}

			/* no background on index column */
			:global(th.index) {
				background: var(--c-body);
			}

			/* custom alignment for chain sort indicator (no header label) */
			:global(th.chain.sorted svg) {
				right: 0.5rem;
			}

			:global(td.chain) {
				width: 1.875rem;
			}

			:global(td.vault) {
				min-width: 12rem;
			}

			/* flip the sort indicator on columns that use inverse sort */
			:global(:is(th.chain, th.vault, th.last_deposit, th.denomination, th.fees) svg) {
				rotate: 180deg;
			}

			:global(td) {
				border-block: 1px solid var(--c-text-ultra-light);
				padding: 0.25em 0.5em;

				--c-col-a: var(--c-box-3);
				--c-col-b: var(--c-box-1);

				/* alternating column colors */
				&:nth-child(even) {
					background-color: var(--c-col-a);
				}

				&:nth-child(odd) {
					background-color: var(--c-col-b);
				}
			}

			/* reverse column colors if chain col is present */
			:global(:where(tr:has(.chain)) td) {
				&:nth-child(odd) {
					background-color: var(--c-col-a);
				}

				&:nth-child(even) {
					background-color: var(--c-col-b);
				}
			}

			:global(td:has(.tooltip)) {
				position: relative;
			}

			:global(.multiline) {
				display: grid;
				gap: 0.125rem;
			}

			:global(td.index) {
				text-align: center;
				vertical-align: middle;
				background-color: var(--c-col-b);
				counter-increment: rowNumber;

				&::before {
					content: counter(rowNumber);
				}
			}

			:global(td.chain) {
				vertical-align: middle;
				text-align: center;
				padding-right: 0.25rem;
				/* override background color to match vault column */
				background-color: var(--c-col-a);
			}

			:global(.vault-address) {
				min-width: 8rem;
				padding: 0;
				background: none;
				font: inherit;
				letter-spacing: inherit;
				border-radius: 0;
			}

			:global(
				:is(
					td.current_tvl_usd,
					td.return_ann_1m,
					td.return_1m,
					td.return_ann_3m,
					td.return_3m,
					td.sharpe_3m,
					td.volatility_3m,
					td.lifetime_return_ann,
					td.lifetime_return,
					td.age_years,
					td.last_deposit,
					td.peak_tvl_usd,
					td.deposit_redeem_count,
					td.fees
				)
			) {
				text-align: right;
			}

			:global(td.denomination) {
				text-align: center;
			}
		}
	}
</style>
