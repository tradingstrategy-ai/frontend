<script lang="ts">
	/*

		Render dynamic tables using server-side sorting and filtering using DataTables library.

		https://datatables.net/manual/index

		The CSS files generated with the Datatables bundler:

		https://datatables.net/download/

		npm install --save datatables.net-bs4
		npm install --save datatables.net-responsive-bs4

	 */
    // https://svelte.dev/repl/a4684fe5be9a4c63963bb128c4adf056?version=3.23.2
	import { browser } from '$app/env';
	import jQuery from 'jQuery';
	import datatableModule from 'datatables.net-dt';
	import Skeleton from '$lib/Skeleton.svelte';

	// DataTables CSS
	// import 'datatables.net-dt/css/jquery.datatables.css';
	//import 'datatables.net-bs4';
	import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
	import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.css';

	import { onMount } from 'svelte';

	// See https://datatables.net/reference/option/columns
	export let columns;

	// See https://datatables.net/reference/option/
	export let options;

	// Make rows clickable.
	// Use the first <a> tag within the row for the link target
	export let clickableRows = false;

	// Is DataTables initialised
	let loaded = false;

	let el; // table element
	let table; // table object (API)

	let extraClass = clickableRows ? "clickable" : "";


	// jQuery, jQuery never fails
	function installRowHandlers() {

		if(!clickableRows) {
			return;
		}

		jQuery(el).on('click', 'tbody tr', function(e, e2) {
			// Find the first <a> element as the click target
			const row = jQuery(e.currentTarget);
			const link = row.find("a");
			const loc = link.attr("href");
		  	window.location.href = loc;
		});
	}

	onMount(async () => {
		if (browser) {
			const DataTable = datatableModule();

			let _options = options || {};
			_options["columns"] = columns;

			let table = new DataTable(el, _options);

			// https://datatables.net/reference/event/draw
			table.on( 'draw', function () {
				console.log( 'Redraw occurred at: '+new Date().getTime() );
				// Datatables fires not one but two redraw events
				// Add some timeout  before making the datatables visible
				// to avoid page layout shifts on the second redraw event
				setTimeout(() => {loaded = true; installRowHandlers() }, 250);
			} );

			table.draw();
			console.log("DataTable loaded");
		}
	});
</script>


<div class="datatables-wrapper">
	<table bind:this={el}  class={"table table-datatable " + extraClass} style={loaded ? "display: table" : "display: none"}>
		<thead>
			<tr>
				{#each columns as column}
					<th>{ column.name }</th>
				{/each}
			</tr>
		</thead>
		<tbody />
	</table>
	<div class="data-tables-skeleton" style={!loaded ? "display: block" : "display: none"}>
		<Skeleton />
	</div>
</div>

<style>
	.table-datatable {
		width: 100%;
		margin-bottom: 20px;
	}

	.datatables-wrapper :global(.paginate_button)  {
		margin: 0 10px;
		border-bottom: 1px solid black;
	}

	.datatables-wrapper :global(.dataTables_info)  {
		float: left;

	}

	.datatables-wrapper :global(.dataTables_paginate)  {
		float: right;
	}

	@media(max-width: 960px) {

		.datatables-wrapper :global(.dataTables_info)  {
			float: none;
			text-align: center;
			margin-bottom: 20px;

		}

		.datatables-wrapper :global(.dataTables_paginate)  {
			float: none;
			text-align: center;
		}

	}

	.datatables-wrapper :global(.paginate_button)  {
		font-weight: lighter;
	}

	.datatables-wrapper :global(.paginate_button.current)  {
		font-weight: bold;
	}

	.datatables-wrapper :global(.paginate_button.disabled)  {
		opacity: 0.3;
	}

	/* Clickable rows */
	.clickable :global(tr)  {
		cursor: pointer;
	}

	.clickable tbody :global(tr):hover  {
		background: #80DEEA;
	}

</style>
