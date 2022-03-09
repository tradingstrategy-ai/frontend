<script>
	/**
	 * Tokens Explorer
	 *
	 */

	import Datatable from '$lib/datatable/datatable.svelte';

	import { backendUrl } from '$lib/config';

	// The chain slug for which the exchanges pairs are rendered like ["binance"]
	export let chainSlug = null;

	// What columns we will show in the explorer.
	// See allColumns for options.
	export let enabledColumns = ['name', 'symbol'];

	export let orderColumnIndex = 2;

	export let orderColumnDirection = 'desc';

	// https://tradingstrategy.ai/api/tokens/
	// See
	// https://datatables.net/reference/option/columns
	// https://datatables.net/reference/option/columns.render
	// https://datatables.net/reference/option/columns.type
	const availableColumns = {
		name: {
			name: 'Name',
			className: 'col-token',
			data: 'name',

			render: function (data, type, row, meta) {
				return `<a href="/trading-view/${chainSlug}/tokens/${row.address}">${row.name}</a>`;
			}
		},
		symbol: {
			name: 'Symbol',
			className: 'col-symbol',
			data: 'symbol',
			render: function (data, type, row, meta) {
				return `<a href="/trading-view/${chainSlug}/tokens/${row.address}">${row.symbol}</a>`;
			}
		}
	};

	// Build columns based on the component arguments
	const columns = [];
	for (const columnName of enabledColumns) {
		const column = availableColumns[columnName];
		if (!column) {
			throw new Error(`Unknown column: ${columnName}`);
		}
		columns.push(column);
	}

	const options = {
		order: [[orderColumnIndex, orderColumnDirection]],
		searching: false,
		serverSide: false,
		lengthChange: false,
		scrollX: false,

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
			const params = {};

			if (chainSlug) {
				params.chain_slug = chainSlug;
			}

			// https://tradingstrategy.ai/api/explorer/#/Token/web_tokens
			const encoded = new URLSearchParams({chain_slug: params.chain_slug});
			const url = `${backendUrl}/tokens?${encoded}`;
			const resp = await fetch(url);

			if (!resp.ok) {
				// Decode 422 invalid input parameter error from the server
				// with JSON payload
				let errorDetails;
				try {
					// GenericErrorModel in OpenAPI
					errorDetails = await resp.json();
					callback({ error: errorDetails.message });
				} catch (e) {}

				console.log('API error:', resp, 'error details:', errorDetails);
				return;
			}

			const result = await resp.json();
			console.log('Got token result', result);

			result.recordsTotal = result.length;
			result.recordsFiltered = result.length;
			result.data = result;

			callback(result);
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
