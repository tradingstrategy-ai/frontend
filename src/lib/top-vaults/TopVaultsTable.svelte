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
	import MultiValCell, { multiValCompareFn } from './MultiValCell.svelte';
	import FeesCell from './FeesCell.svelte';
	import { createTable } from 'svelte-headless-table';
	import { addSortBy, addHiddenColumns, addTableFilter } from 'svelte-headless-table/plugins';
	import { createRender } from '$lib/components/datatable/utils';
	import { readable } from 'svelte/store';
	import { formatDollar, formatNumber, formatPercent, formatValue } from '$lib/helpers/formatters';
	import RiskCell from './RiskCell.svelte';
	import DepositEventsCell from './DepositEventsCell.svelte';

	interface Props {
		topVaults: TopVaults;
		apiChain?: ApiChain;
	}

	const { topVaults, apiChain }: Props = $props();

	const formatReturn = (v: number | null) => formatPercent(v, 2);
	const formatTvl = (v: number | null) => formatDollar(v, 2);

	const vaultsStore = readable(topVaults.vaults);

	const table = createTable(vaultsStore, {
		hide: addHiddenColumns({ initialHiddenColumnIds: apiChain ? ['chain'] : [] }),
		sort: addSortBy({
			initialSortKeys: [{ id: 'one_month_return_ann', order: 'desc' }],
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
			cell: () => '' // populated with row index via `rowNumber` CSS counter
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
					getSortValue: ({ name }) => name.trim().toLowerCase(),
					invert: true
				},
				filter: {
					getFilterValue: ({ name, protocol }) => `${name} ${protocol}`
				}
			}
		}),
		table.column({
			id: 'one_month_return_ann',
			accessor: (vault) => [vault.one_month_cagr_net, vault.one_month_cagr],
			header: '1M return ann.<br/>(net/&ZeroWidthSpace;gross)',
			cell: ({ value }) => createRender(MultiValCell, { values: value, formatter: formatReturn }),
			plugins: {
				sort: { compareFn: multiValCompareFn },
				filter: { exclude: true }
			}
		}),
		table.column({
			id: 'lifetime_return_abs',
			accessor: (vault) => [vault.lifetime_return_net, vault.lifetime_return],
			header: 'Lifetime return abs.<br/>(net/&ZeroWidthSpace;gross)',
			cell: ({ value }) => createRender(MultiValCell, { values: value, formatter: formatReturn }),
			plugins: {
				sort: { compareFn: multiValCompareFn },
				filter: { exclude: true }
			}
		}),
		table.column({
			id: 'lifetime_return_ann',
			accessor: (vault) => [vault.cagr_net, vault.cagr],
			header: 'Lifetime return ann.<br/>(net/&ZeroWidthSpace;gross)',
			cell: ({ value }) => createRender(MultiValCell, { values: value, formatter: formatReturn }),
			plugins: {
				sort: { compareFn: multiValCompareFn },
				filter: { exclude: true }
			}
		}),
		table.column({
			id: 'three_months_return_ann',
			accessor: (vault) => [vault.three_months_cagr_net, vault.three_months_cagr],
			header: '3M return ann.<br/>(net/&ZeroWidthSpace;gross)',
			cell: ({ value }) => createRender(MultiValCell, { values: value, formatter: formatReturn }),
			plugins: {
				sort: { compareFn: multiValCompareFn },
				filter: { exclude: true }
			}
		}),
		table.column({
			accessor: 'three_months_sharpe',
			header: '3M Sharpe',
			cell: ({ value }) => formatNumber(value, 1),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'three_months_volatility',
			header: '3M vola&shy;tility',
			cell: ({ value }) => formatPercent(value),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: 'denomination',
			header: 'Denom&shy;ination',
			cell: ({ value }) => formatValue(value),
			plugins: { sort: { invert: true } }
		}),
		table.column({
			id: 'tvl',
			accessor: (vault) => [vault.current_nav, vault.peak_nav],
			header: 'TVL USD<br/>(current/&ZeroWidthSpace;peak)',
			cell: ({ value }) => createRender(MultiValCell, { values: value, formatter: formatTvl }),
			plugins: {
				sort: { compareFn: multiValCompareFn },
				filter: { exclude: true }
			}
		}),
		table.column({
			id: 'age',
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
			id: 'fees',
			header: 'Fees<br>(mgmt/&ZeroWidthSpace;perf)',
			accessor: ({ mgmt_fee, perf_fee }) => ({ mgmt_fee, perf_fee }),
			cell: ({ value }) => createRender(FeesCell, value),
			plugins: {
				sort: {
					// sort by perf_fee then mgmt_fee (scaled down as tie-break), nulls last
					getSortValue: ({ perf_fee, mgmt_fee }) => (perf_fee ?? 1) + (mgmt_fee ?? 1) / 100,
					invert: true
				},
				filter: { exclude: true }
			}
		}),
		table.column({
			accessor: 'event_count',
			header: 'Deposit events',
			cell: ({ value }) => createRender(DepositEventsCell, { value }),
			plugins: { filter: { exclude: true } }
		}),
		table.column({
			accessor: ({ risk, risk_numeric }) => ({ risk, risk_numeric }),
			header: 'Technical risk',
			cell: ({ value }) => createRender(RiskCell, value),
			plugins: {
				sort: {
					getSortValue: (v) => v.risk_numeric ?? Infinity,
					invert: true
				}
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

			/* flip the sort indicator on columns that use inverted sort */
			:global(:is(th.chain, th.vault, th.denomination, th.fees, th.risk) svg) {
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
				min-width: 7rem;
				padding: 0;
				border-radius: 0;
				background: transparent !important;
				font: var(--f-ui-xs-roman);
				letter-spacing: var(--ls-ui-xs, normal);

				:global(a):not(:hover) {
					text-decoration: none;
				}
			}

			:global(
				:is(
					td.one_month_return_ann,
					td.lifetime_return_abs,
					td.lifetime_return_ann,
					td.three_months_return_ann,
					td.three_months_sharpe,
					td.three_months_volatility,
					td.tvl,
					td.age,
					td.fees,
					td.event_count
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
