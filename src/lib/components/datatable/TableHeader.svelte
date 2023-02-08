<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Subscribe, Render, type HeaderRow } from 'svelte-headless-table';
	import Select from '../Select.svelte';

	export let attrs: HTMLAttributes<HTMLTableSectionElement>;
	export let rows: HeaderRow<any, any>[];

	let tableHead: HTMLTableSectionElement;
	let tableHeadRect: DOMRect;

	$: tableHeadY = tableHeadRect?.y;
</script>

<svelte:window on:scroll={() => (tableHeadRect = tableHead.getBoundingClientRect())} />

<div class="mobile-sorting">
	<Select>
		{#each rows as headerRow (headerRow.id)}
			{#each headerRow.cells as cell (cell.id)}
				<option value={cell.id}>{cell.label}</option>
			{/each}
		{/each}
	</Select>
</div>
<thead {...attrs} bind:this={tableHead} class:sticky={tableHeadY <= 0}>
	{#each rows as headerRow (headerRow.id)}
		<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
			<tr {...rowAttrs}>
				{#each headerRow.cells as cell (cell.id)}
					<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
						<th
							{...attrs}
							class={cell.id}
							class:sortable={props.sort && !props.sort.disabled}
							class:sorted={props.sort?.order}
							on:click={() => props.sort?.toggle?.()}
						>
							<Render of={cell.render()} />
							{#if props.sort?.order === 'asc'}
								<span class="sorting-indicator">▲</span>
							{:else if props.sort?.order === 'desc'}
								<span class="sorting-indicator">▼</span>
							{/if}
						</th>
					</Subscribe>
				{/each}
			</tr>
		</Subscribe>
	{/each}
	<slot />
</thead>

<style lang="postcss">
	th.sortable {
		cursor: pointer;
	}

	th.sorted {
		padding: var(--space-md) var(--space-xl) var(--space-md) var(--space-ls);
	}

	.sorting-indicator {
		position: absolute;
		right: var(--space-md);
	}
</style>
