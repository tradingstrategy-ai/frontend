<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Subscribe, Render, type HeaderRow } from 'svelte-headless-table';
	import IconChevronUp from '~icons/local/chevron-up';
	import IconChevronDown from '~icons/local/chevron-down';

	export let attrs: HTMLAttributes<HTMLTableSectionElement>;
	export let rows: HeaderRow<any, any>[];
</script>

<thead {...attrs}>
	{#each rows as headerRow (headerRow.id)}
		<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
			<tr class="col-headers" {...rowAttrs}>
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
								<IconChevronUp />
							{:else if props.sort?.order === 'desc'}
								<IconChevronDown />
							{/if}
						</th>
					</Subscribe>
				{/each}
			</tr>
		</Subscribe>
	{/each}
	<slot />
</thead>

<style>
	.sortable {
		cursor: pointer;
		user-select: none;

		&:hover {
			color: var(--c-text-light);
		}

		:global(.icon path) {
			stroke-width: 0.1875rem;
		}
	}

	.sorted {
		color: var(--c-text);
	}
</style>
