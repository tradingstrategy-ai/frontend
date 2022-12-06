<script lang="ts">
	import type { TradingPosition } from 'trade-executor-frontend/state/interface';
	import { readable } from 'svelte/store';
	import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
	import { formatUnixTimestampAsHours } from 'trade-executor-frontend/helpers/formatters';
	import { formatDollar } from '$lib/helpers/formatters';
	import { Button } from '$lib/components';
	import Profitability from './Profitability.svelte';

	export let strategyId: string;

	export let positions: TradingPosition[] = [];

	const table = createTable(readable(positions));

	const columns = table.createColumns([
		table.column({
			header: 'Id',
			accessor: 'position_id'
		}),
		table.column({
			header: 'Ticker',
			accessor: 'ticker'
		}),
		table.column({
			header: 'Profitability',
			accessor: 'profitability',
			cell: ({ value }) => createRender(Profitability, { value })
		}),
		table.column({
			header: 'Value',
			id: 'value',
			accessor: ({ value }) => formatDollar(value)
		}),
		table.column({
			header: 'Opened',
			id: 'opened',
			accessor: ({ opened_at }) => formatUnixTimestampAsHours(opened_at)
		}),
		table.column({
			header: '',
			id: 'button',
			accessor: 'position_id',
			cell: ({ value }) =>
				createRender(Button, {
					tertiary: true,
					label: 'Details',
					href: `/strategy/${strategyId}/open-positions/${value}`
				})
		})
	]);

	const { headerRows, rows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<table {...$tableAttrs}>
	<thead>
		{#each $headerRows as headerRow (headerRow.id)}
			<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<th class={cell.id} {...attrs}>
								<Render of={cell.render()} />
							</th>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</thead>
	<tbody {...$tableBodyAttrs}>
		{#each $rows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<td class={cell.id} {...attrs}>
								<Render of={cell.render()} />
							</td>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	table {
		border-collapse: separate;
		border-spacing: 0 0.75rem;
		width: 100%;

		@media (--viewport-sm-down) {
			max-width: calc(100vw - 2rem);
			display: inline-block;
			overflow-x: auto;
		}
	}

	thead {
		position: sticky;
		top: 0;
	}

	th {
		padding: 1rem 1.25rem;
		background-color: var(--c-body);
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
	}

	td {
		background: var(--c-background-5);
		padding: 0.75rem 1.5rem;
		font: var(--f-ui-lg-medium);
		--button-width: 100%;

		@media (max-width: 1260px) {
			font: var(--f-ui-md-medium);
		}

		@nest tr:hover & {
			background: var(--c-background-4);
		}

		&:first-child {
			border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		}

		&:last-child {
			border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
		}
	}

	.profitability,
	.value,
	.opened {
		text-align: right;
	}
</style>
