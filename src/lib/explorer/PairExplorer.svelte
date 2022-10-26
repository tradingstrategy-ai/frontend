<!--
@component
Explore trading pairs that match certain filter criteria.

#### Usage:
```tsx
	<PairExplorer
		exchangeSlug="uniswap-v2"
		chainSlug="ethereum"
		tokenSymbol="WETH"
		tokenAddress="OXC0..."
		enabledColumns={['pair_name', 'exchange_name', 'usd_price_latest', ...]}
		orderColumnIndex={4}
		orderColumnDirection="asc|desc"
		pageLength={50}
	/>
```
-->
<script lang="ts">
	import { backendUrl } from '$lib/config';
	import Datatable from '$lib/datatable/datatable.svelte';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { escapeHtml } from '$lib/helpers/html';

	export let exchangeSlug = undefined;
	export let chainSlug = undefined;
	export let tokenSlug = undefined;
	export let tokenSymbol = undefined;
	export let tokenAddress = undefined;
	// What columns we will show in the explorer; see allColumns for options.
	export let enabledColumns = ['pair_name', 'usd_price_latest'];
	export let orderColumnIndex = 3;
	export let orderColumnDirection = 'desc';
	export let pageLength = 10;

	// Currently server-side supports the following sort options: volume, liquidity, price change
	// https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
	// See https://datatables.net/reference/option/columns

	// All possible configurable columns. These match the data is available from the backend.
	const allColumns = {
		pair_name: {
			name: 'Trading pair',
			className: 'col-pair',
			data: 'pair_name',
			serverSideSortKey: null,
			orderable: false,
			// https://datatables.net/reference/option/columns.render
			render: function (data, type, row, meta) {
				const chain = escapeHtml(row.chain_slug);
				const exchange = escapeHtml(row.exchange_slug);
				const pair = escapeHtml(row.pair_slug);
				const symbols = escapeHtml(row.pair_symbol);
				return `<a href="/trading-view/${chain}/${exchange}/${pair}">${symbols}</a>`;
			}
		},

		exchange_name: {
			name: 'Exchange',
			className: 'col-exchange',
			data: 'exchange_name',
			serverSideSortKey: null,
			orderable: false,
			// https://datatables.net/reference/option/columns.render
			render: function (data, type, row, meta) {
				const chain = escapeHtml(row.chain_slug);
				const exchange_slug = escapeHtml(row.exchange_slug);
				const exchange_name = escapeHtml(row.exchange_name);
				return `<a href="/trading-view/${chain}/${exchange_slug}">${exchange_name}</a>`;
			}
		},

		usd_price_latest: {
			name: 'Price (USD)',
			orderable: false,
			data: 'usd_price_latest',
			serverSideSortKey: null,
			className: 'col-price numeric',
			type: 'num', // https://datatables.net/reference/option/columns.type
			render: function (data, type, row, meta) {
				return formatDollar(data);
			}
		},

		price_change_24h: {
			name: 'Price 24h Δ',
			data: 'price_change_24h',
			serverSideSortKey: 'price_change_24h',
			className: 'col-price-change numeric',
			type: 'num', // https://datatables.net/reference/option/columns.type
			render: function (data, type, row, meta) {
				return formatPriceChange(data);
			}
		},

		usd_volume_24h: {
			name: 'Volume 24h (USD)',
			data: 'usd_volume_24h',
			className: 'col-volume-24h numeric',
			serverSideSortKey: 'volume_1d',
			type: 'num', // https://datatables.net/reference/option/columns.type
			render: function (data, type, row, meta) {
				return formatDollar(data);
			}
		},

		usd_volume_30d: {
			name: 'Volume 30d (USD)',
			data: 'usd_volume_30d',
			className: 'col-volume-30d numeric',
			serverSideSortKey: 'volume_30d',
			type: 'num', // https://datatables.net/reference/option/columns.type
			render: function (data, type, row, meta) {
				return formatDollar(data);
			}
		},

		usd_liquidity_latest: {
			name: 'Liquidity (USD)',
			data: 'usd_liquidity_latest',
			serverSideSortKey: 'liquidity',
			className: 'col-liquidity numeric',
			type: 'num', // https://datatables.net/reference/option/columns.type
			render: function (data, type, row, meta) {
				return formatDollar(data);
			}
		},

		liquidity_change_24h: {
			name: 'Liq 24h Δ',
			orderable: false,
			data: 'liquidity_change_24h',
			className: 'col-liquidity-change numeric',
			type: 'num', // https://datatables.net/reference/option/columns.type
			render: function (data, type, row, meta) {
				return formatPriceChange(data);
			}
		}
	};

	// Build columns based on the component arguments
	const columns = [];
	for (const columnName of enabledColumns) {
		const column = allColumns[columnName];
		if (!column) {
			throw new Error(`Unknown column: ${columnName}`);
		}
		columns.push(column);
	}

	function getAjaxParams(data) {
		// Match column index given by DataTables to the server-side sort key
		const sortColumnIndex = data.order[0].column;
		const sortKey = columns[sortColumnIndex].serverSideSortKey;

		if (!sortKey) {
			throw new Error(`Column does not support sorting: ${sortColumnIndex}`);
		}

		const params = {
			direction: data.order[0].dir === 'desc' ? 'desc' : 'asc',
			sort: sortKey,
			// https://datatables.net/manual/server-side
			page_size: data.length,
			// Zero-based rendered page
			page: data.start,
			tokenSymbol,
			chain_slugs: chainSlug,
			exchange_slugs: exchangeSlug,
			token_slugs: tokenSlug,
			token_addresses: tokenAddress
		};

		// return a sparse version of params (undefined values removed)
		return JSON.parse(JSON.stringify(params));
	}

	async function decodeAjaxError(resp) {
		const errorDetails = await resp.json();
		return `${resp.statusText} ${errorDetails.message}`;
	}

	const options = {
		order: [[orderColumnIndex, orderColumnDirection]], // Default sorting is liquidity desc
		searching: false,
		serverSide: true,
		lengthChange: false,
		pageLength: pageLength,

		// TODO: If set we would be mobile compatible, but causes the table header to disappear
		// because whatever jQuery trickery is used to render this
		scrollX: false,

		// Add DataTable.createRow callback to style rows
		// https://datatables.net/reference/option/createdRow
		createdRow: function (row: HTMLTableRowElement, data: any) {
			const priceChangeClass = determinePriceChangeClass(data.price_change_24h);
			row.querySelector('.col-price-change')?.classList.add(priceChangeClass);
			const liqChangeClass = determinePriceChangeClass(data.liquidity_change_24h);
			row.querySelector('.col-liquidity-change')?.classList.add(liqChangeClass);
		},

		/**
		 * AJAX data fetch hook for Datatables
		 *
		 * https://datatables.net/reference/option/ajax
		 *
		 * @param data See https://datatables.net/manual/server-side
		 * @param callback When the data has been obtained from the data source, the second parameter (callback here) should be called with a single parameter passed in - the data to use to draw the table.
		 * @param settings Setting for the table: https://datatables.net/reference/type/DataTables.Settings
		 */
		ajax: async function (data, callback, settings) {
			// https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
			const urlParams = new URLSearchParams(getAjaxParams(data));
			const url = `${backendUrl}/pairs?${urlParams}`;

			const resp = await fetch(url);

			if (resp.ok) {
				// Result object: {total: 57483, pages: 575, results: Array(100)
				const result = await resp.json();
				callback({
					recordsTotal: result.total,
					recordsFiltered: result.total,
					data: result.results
				});
			} else {
				settings.oLanguage.sEmptyTable = await decodeAjaxError(resp);
				callback({
					data: [],
					recordsTotal: 0,
					recordsFiltered: 0
				});
			}
		}
	};
</script>

<div class="trading-pairs" style:--columns={columns.length}>
	<Datatable {columns} {options} clickableRows={true} />
</div>

<style lang="postcss">
	.trading-pairs :global {
		/* set columns widths to equal % to minimize resizing when paging/sorting */
		& td {
			width: calc(100% / var(--columns));
		}

		/* prevent pair and exchange columns from wraping */
		& .col-pair,
		& .col-exchange {
			white-space: nowrap;
		}
	}
</style>
