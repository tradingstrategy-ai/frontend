<script lang="ts">
	/*

		Render dynamic tables using server-side sorting and filtering using DataTables library.

		https://datatables.net/manual/index

	 */
    // https://svelte.dev/repl/a4684fe5be9a4c63963bb128c4adf056?version=3.23.2
	import { browser } from '$app/env';
	import datatableModule from 'datatables.net-dt';
	import Skeleton from '$lib/Skeleton.svelte';

	import { onMount } from 'svelte';

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

	// Is DataTables initialised
	let loaded = false;

	let el; // table element
	let table; // table object (API)
	export let columns;
	export let options;

	onMount(async () => {
		if (browser) {
			const DataTable = datatableModule();
			let table = new DataTable(el, options || {});
			table.draw();
			loaded = true;
			console.log("DataTable loaded");
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" />
</svelte:head>


<div class="data-tables-loader">
	<table bind:this={el}  class="table table-datasets" style={loaded ? "display: block" : "display: none"}>
		<thead>
			<tr>
				{#each columns as column}
					<th>{column}</th>
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
	.table-datasets {
		width: 100%;
	}
</style>