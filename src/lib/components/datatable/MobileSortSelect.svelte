<script lang="ts">
	import type { SortKey, WritableSortKeys } from 'svelte-headless-table/plugins';
	import { Subscribe, type HeaderRow } from 'svelte-headless-table';
	import { Select } from '$lib/components';

	export let rows: HeaderRow<any, any>[];
	export let sortKeys: WritableSortKeys;

	function sortValue({ id, order }: { id: string; order: string }) {
		return `${id}:${order}`;
	}

	function handleChange({ target }: Event) {
		const [id, order] = (target as HTMLSelectElement).value.split(':');
		$sortKeys = [{ id, order } as SortKey];
	}
</script>

<tr class="mobile-sort-select">
	<th>
		<Select value={sortValue($sortKeys[0])} on:change={handleChange}>
			{#each rows as headerRow (headerRow.id)}
				{#each headerRow.cells as cell (cell.id)}
					<Subscribe props={cell.props()} let:props>
						{@const sort = props.sort}
						{#if sort && !sort.disabled}
							{#each [['desc', '▼'], ['asc', '▲']] as [order, indicator]}
								<option value={sortValue({ ...cell, order })} selected={sort.order === order}>
									{cell.label}
									{indicator}
								</option>
							{/each}
						{/if}
					</Subscribe>
				{/each}
			{/each}
		</Select>
	</th>
</tr>

<style>
	.mobile-sort-select {
		display: grid;

		@media (--viewport-md-up) {
			display: none;
		}

		th {
			padding: var(--space-md) 0;
		}
	}
</style>
