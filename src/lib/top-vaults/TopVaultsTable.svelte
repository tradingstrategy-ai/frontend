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
	// import LastDepositCell from './LastDepositCell.svelte';
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
			initialSortKeys: [{ id: 'one_month_returns', order: 'desc' }],
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
			accessor: ({ chain_id }) => {
				const chain = getChain(chain_id);
				const label = chain?.name ?? `Chain ${chain_id}`;
				return { chain_id, chain, label };
			},
			cell: ({ value }) => createRender(ChainCell, value),
			plugins: {
				sort: {
					getSortValue: ({ label }) => label,
					invert: true
				},
				filter: {
					getFilterValue: ({ chain_id, chain }) => `${chain_id} ${chain?.name}`
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
			accessor: 'current_nav',
			header: 'Current TVL (USD)',
			cell: ({ value }) => formatDollar(value, 2, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'one_month_cagr',
			header: '1M return (ann.)',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'one_month_returns',
			header: '1M return',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'three_months_cagr',
			header: '3M return (ann.)',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'three_months_returns',
			header: '3M return',
			cell: ({ value }) => formatPercent(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'three_months_sharpe',
			header: '3M Sharpe',
			cell: ({ value }) => formatNumber(value, 1),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'three_months_volatility',
			header: '3M vola-tility',
			cell: ({ value }) => formatPercent(value),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'cagr',
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
			accessor: 'years',
			header: 'Age (years)',
			cell: ({ value }) => formatNumber(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		// `last_deposit` is missing from latest data schema so dropping from table for now
		// table.column({
		// 	header: 'Last deposit',
		// 	accessor: 'last_deposit',
		// 	cell: ({ value }) => createRender(LastDepositCell, { last_deposit: value }),
		// 	plugins: { filter: { exclude: true } }
		// }),
		table.column({
			accessor: 'denomination',
			header: 'Denom-ination',
			cell: ({ value }) => formatValue(value),
			plugins: { sort: { invert: true } }
		}),
		table.column({
			accessor: 'peak_nav',
			header: 'Peak TVL (USD)',
			cell: ({ value }) => formatDollar(value, 2),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'event_count',
			header: 'Deposits & Redeems', // NOTE: non-breaking space after "&"
			cell: ({ value }) => formatAmount(value),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			id: 'fees',
			header: 'Fees',
			accessor: ({ mgmt_fee, perf_fee }) => ({ mgmt_fee, perf_fee }),
			cell: ({ value }) => createRender(FeesCell, value),
			plugins: {
				sort: {
					getSortValue: ({ mgmt_fee, perf_fee }) => (mgmt_fee ?? 0) + (perf_fee ?? 0),
					invert: true
				},
				filter: { exclude: true }
			}
		}),
		table.column({
			id: 'address',
			header: 'Vault address',
			accessor: ({ address, chain_id }) => ({ address, chain_id }),
			cell: ({ value: { address, chain_id } }) =>
				createRender(CryptoAddressWidget, {
					class: 'vault-address',
					size: 'sm',
					address,
					href: getExplorerUrl(getChain(chain_id), address)
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
					td.current_nav,
					td.one_month_cagr,
					td.one_month_returns,
					td.three_months_cagr,
					td.three_months_returns,
					td.three_months_sharpe,
					td.three_months_volatility,
					td.cagr,
					td.lifetime_return,
					td.years,
					td.last_deposit,
					td.peak_nav,
					td.event_count,
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
