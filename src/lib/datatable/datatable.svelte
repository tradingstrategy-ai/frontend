<!--
@component
Render dynamic tables using server-side sorting and filtering using DataTables library.
While the DataTables is settings up itself, serve a skeleton loader.

https://datatables.net/manual/index

The CSS files generated with the Datatables bundler:

https://datatables.net/download/

npm install --save datatables.net-bs4
npm install --save datatables.net-responsive-bs4
-->
<script lang="ts">
	import datatableModule from 'datatables.net-dt';
	// DataTables CSS
	import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
	import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.css';
	import Skeleton from '$lib/Skeleton.svelte';

	// See https://datatables.net/reference/option/columns
	export let columns: any[] = [];

	// See https://datatables.net/reference/option/
	export let options = {};

	// Make rows clickable; use the first <a> tag within the row for the link target
	export let clickableRows = false;

	// Is DataTables initialised
	let loaded = false;

	function handleRowClicks(node: HTMLTableSectionElement) {
		if (!clickableRows) return;
		node.addEventListener('click', (event: MouseEvent) => {
			// if screenX === 0 this is a simulated click event (so abort)
			if (event.screenX === 0) return;
			event.preventDefault();
			const row = (event.target as HTMLElement).closest('tr');
			// simulate click on first anchor tag in the row
			row?.querySelector('a')?.click();
		});
	}

	function dataTable(node: HTMLTableElement) {
		const DataTable = datatableModule();
		const table = new DataTable(node, { ...options, columns });

		// https://datatables.net/reference/event/draw
		table.on('draw', function () {
			console.log('Redraw occurred at: ' + new Date().getTime());
			// Datatables fires not one but two redraw events; add some timeout before making the
			// datatables visible to avoid page layout shifts on the second redraw event
			setTimeout(() => {
				loaded = true;
			}, 250);
		});

		table.draw();
		console.log('DataTable loaded');
	}
</script>

<div class="datatables-wrapper">
	<div class="table-responsive">
		<table use:dataTable class="table" class:clickable={clickableRows} style:display={loaded ? 'table' : 'none'}>
			<thead>
				<tr>
					{#each columns as column}
						<th>{column.name}</th>
					{/each}
				</tr>
			</thead>
			<tbody use:handleRowClicks />
		</table>
	</div>
	<div style:display={loaded ? 'none' : 'block'}>
		<Skeleton layout="full" />
	</div>
</div>

<style lang="postcss">
	table {
		width: 100% !important;
		margin: 0 !important;
		font-variant-numeric: tabular-nums;

		& :global th {
			border-top: none;
			border-bottom: 2px solid var(--c-border-1);
			white-space: nowrap;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}

		& :global td {
			border-bottom: 1px solid var(--c-border-1);
			padding-block: 1.75rem;
			font: var(--f-ui-body-roman);
		}

		& :global .numeric {
			text-align: right;
		}

		&.clickable :global tbody tr {
			cursor: pointer;

			&:hover {
				background: var(--c-background-6);
			}
		}
	}

	.datatables-wrapper :global {
		contain: paint;

		/* Fix sorting icon size & position */
		& .sorting::before,
		& .sorting::after {
			font-size: 1.5rem;
			transform: translate(0px, -3px);
		}

		& .dataTables_info {
			margin-block: 2rem 0;
			padding: 0;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: var(--c-text-2);
			text-align: left;

			@media (--viewport-md-up) {
				float: left;
			}
		}

		& .dataTables_paginate {
			margin-block: 1rem 2rem;
			padding: 0;
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			text-align: left;

			@media (--viewport-md-up) {
				margin-block: 2rem 0;
				text-align: right;
			}
		}

		& .paginate_button {
			border-bottom: none;
			margin-inline: 0.25rem;
			font: inherit;
			color: var(--c-text-1);

			&.current,
			&:hover {
				border-bottom: 1px solid currentColor;
				transition: none;
			}

			&.previous {
				margin-left: 0;
				margin-right: 0.375rem;
				font-weight: 500;
			}

			&.next {
				margin-left: 0.375rem;
				margin-right: 0;
				font-weight: 500;
			}

			&.disabled {
				color: var(--c-text-7);
			}
		}
	}
</style>
