<script lang="ts">
    // https://svelte.dev/repl/a4684fe5be9a4c63963bb128c4adf056?version=3.23.2
	import { browser } from '$app/env';
	import jQuery from 'jquery';
	import datatableModule from 'datatables.net-dt';

	import { onMount, tick } from 'svelte';

    const wait = delay => new Promise(resolve => setTimeout(resolve, delay))

    const load = async () => {
	    await wait(500)
	    return [
			[ "Tiger Nixon", "System Architect", "Edinburgh", "5421", "2011/04/25", "$320,800" ],
			[ "Garrett Winters", "Accountant", "Tokyo", "8422", "2011/07/25", "$170,750" ],
			[ "Ashton Cox", "Junior Technical Author", "San Francisco", "1562", "2009/01/12", "$86,000" ],
	    ]
    }

	let el; // table element
	let table; // table object (API)

	onMount(async () => {
		if (browser) {

			// const module = await import('jquery');
			//console.log("jQuery module is", module);
			// const jQuery = module.jQuery;
			// const jQuery = window.jQuery;
			//const jQuery = module; // Looks like this is supposed to work like this
			console.log("jQuery the function is", jQuery);

			// const jQueryX = jQuery.noConflict(true);

			// Check we have loaded a functional jQuery
			// console.log("jQuery function result", jQuery("body"));

			// https://datatables.net/manual/installation#NPM
			const DataTable = datatableModule();

			let table = new DataTable(el);
			console.log("Got my table", table);
			const result = await load();

			console.log("Result data is", result);

			table.rows.add(result);

			load().then((rows) => {
				table.rows.add(rows).draw();
			});
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" />
</svelte:head>

<table bind:this={el} class="display" style="width:100%">
	<thead>
		<tr>
			<th>Name</th>
			<th>Position</th>
			<th>Office</th>
			<th>Age</th>
			<th>Start date</th>
			<th>Salary</th>
		</tr>
	</thead>
	<tbody />
	<tfoot>
		<tr>
			<th>Name</th>
			<th>Position</th>
			<th>Office</th>
			<th>Age</th>
			<th>Start date</th>
			<th>Salary</th>
		</tr>
	</tfoot>
</table>
<!-- <script lang="ts">
	import { browser } from '$app/env';
	import { onMount, tick } from 'svelte';

	// Dynamically imported uplot
	let jq;

	onMount(async () => {
		if (browser) {
			jq = (await import('jquery')).default;
			console.log('dinamic import', jq, 'example', jq('example').hide());
			jq('#example').click(() => { jq(this).hide(); });
			jq(this).hide();
		}
	});

</script>

<p id="example">Hello World</p> -->
