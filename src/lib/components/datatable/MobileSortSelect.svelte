<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { SortKey } from 'svelte-headless-table/plugins';
	import { Subscribe, type HeaderRow } from 'svelte-headless-table';
	import Select from '$lib/components/Select.svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		rows: HeaderRow<any, any>[];
		sortKeys: Writable<SortKey[]>;
	}

	let { rows, sortKeys }: Props = $props();

	let selectedSortValue = $derived.by(() => {
		const key = $sortKeys[0];
		return key ? sortValue(key) : undefined;
	});

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
		<Select value={selectedSortValue} onchange={handleChange}>
			{#each rows as headerRow (headerRow.id)}
				{#each headerRow.cells as cell (cell.id)}
					<Subscribe props={cell.props()} let:props>
						{@const sort = props.sort}
						{#if sort && !sort.disabled}
							{#each [['desc', '▼'], ['asc', '▲']] as [order, indicator] (order)}
								<option value={sortValue({ ...cell, order })} selected={sort.order === order}>
									<!-- eslint-disable-next-line svelte/require-store-reactive-access -->
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
