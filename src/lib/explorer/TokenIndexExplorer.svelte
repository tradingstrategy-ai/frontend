<script>
	/**
	 * Tokens Explorer
	 */
	import Datatable from '$lib/datatable/datatable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';
	import { backendUrl } from '$lib/config';
	export let chainSlug = null;
	export let enabledColumns = ['name', 'symbol', 'liquidity_latest', 'volume_24h'];
	export let orderColumnIndex = 2;
	export let orderColumnDirection = 'desc';
	export let pageLength = 50;

	const availableColumns = {
		name: {
			name: 'Name',
			className: 'col-token',
			data: 'name',
			orderable: false,
			render: function (data, type, row, meta) {
				return `<a href="/trading-view/${chainSlug}/tokens/${row.address}">${row.name}</a>`;
			}
		},
		symbol: {
			name: 'Symbol',
			className: 'col-symbol',
			data: 'symbol',
			orderable: false,
			render: function (data, type, row, meta) {
				return `<a href="/trading-view/${chainSlug}/tokens/${row.address}">${row.symbol}</a>`;
			}
		},
		liquidity_latest: {
			name: 'Liq 24h Δ',
			data: 'liquidity_latest',
			className: 'col-liquidity-change',
			serverSideSortKey: 'liquidity_latest',
			orderable: true,
			type: 'num',
			render: function (data, type, row, meta) {
				return formatDollar(data);
			}
		},
		volume_24h: {
			name: 'Volume 24h (USD)',
			data: 'volume_24h',
			className: 'col-volume',
			serverSideSortKey: 'volume_24h',
			type: 'num',
			render: function (data, type, row, meta) {
				return formatDollar(data);
			}
		}
	};

	function getAjaxParams(data) {
		const sortColumnIndex = data.order[0].column;
		const sortKey = columns[sortColumnIndex].serverSideSortKey;

		const params = {
			direction: data.order[0].dir === "desc" ? "desc" : "asc",
			chain_slug: chainSlug,
			sort: sortKey
		};

		return JSON.parse(JSON.stringify(params));
	}

	async function decodeAjaxError(resp) {
		const errorDetails = await resp.json();
		return `${resp.statusText} ${errorDetails.message}`;
	}

	const columns = enabledColumns.map((columnName) => {
		if (!availableColumns[columnName]) {
			throw new Error(`Unknown column: ${columnName}`);
		}
		return availableColumns[columnName];
	});

	const options = {
		order: [[orderColumnIndex, orderColumnDirection]], // Default sorting is liquidity desc
		searching: false,
		serverSide: true,
		lengthChange: false,
		scrollX: false,
    pageLength: pageLength,
		/**
		 *
		 * AJAX data fetch hook for Datatables
		 *
		 * https://datatables.net/reference/option/ajax
		 *
		 * @param data See https://datatables.net/manual/server-side
		 * @param callback When the data has been obtained from the data source, the second parameter (callback here) should be called with a single parameter passed in - the data to use to draw the table.
		 * @param settings Setting for the table: https://datatables.net/reference/type/DataTables.Settings
		 */
		ajax: async function (data, callback, settings) {
			const urlParams = new URLSearchParams(getAjaxParams(data));
			const url = `${backendUrl}/tokens?${urlParams}`;
			const response = await fetch(url);

			if (response.ok) {
				const result = await response.json();
				callback({
					recordsTotal: result.total,
					recordsFiltered: result.total,
					data: result.result
				});
			} else {
				settings.oLanguage.sEmptyTable = await decodeAjaxError(response);
				callback({
					data: [],
					recordsTotal: 0,
					recordsFiltered: 0
				});
			}
		}
	};
</script>

<div class="tokens">
	<Datatable {columns} {options} clickableRows={true} />
</div>

<style>
	/* It's getting narrow so let's make some room by decreasing font size from the default 1rem*/
	.tokens :global(.datatables-wrapper) {
		font-size: 0.8rem;
	}

	/* Fix sorting icon position after making the font smaller */
	.tokens :global(.sorting::before) {
		bottom: 1.3em;
	}

	.tokens :global(.sorting::after) {
		bottom: 1.3em;
	}
</style>
