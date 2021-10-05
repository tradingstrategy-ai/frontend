<script lang="ts">
    // https://svelte.dev/repl/a4684fe5be9a4c63963bb128c4adf056?version=3.23.2
	import { browser } from '$app/env';
	import jQuery from 'jquery';
	import datatableModule from 'datatables.net-dt';

	import { onMount, tick } from 'svelte';

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

	let el; // table element
	let table; // table object (API)
	export let columns;
	export let load;
	export let options;

	onMount(async () => {
		if (browser) {
			const DataTable = datatableModule();
			let table = new DataTable(el, options || {});
			const result = await load();
			table.rows.add(result);

			load().then((rows) => {
				table.draw();
				table.column(2).data().sort()
			});

		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" />
</svelte:head>

<table bind:this={el}  class="table table-datasets" style="width:100%">
	<thead>
		<tr>
			{#each columns as column}
				<th>{column}</th>
			{/each}
		</tr>
	</thead>
	<tbody />
</table>

