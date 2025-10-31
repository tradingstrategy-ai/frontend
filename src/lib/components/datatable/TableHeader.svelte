<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Subscribe, Render, type HeaderRow } from 'svelte-headless-table';
	import IconChevronUp from '~icons/local/chevron-up';
	import IconChevronDown from '~icons/local/chevron-down';

	interface Props {
		attrs: HTMLAttributes<HTMLTableSectionElement>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		rows: HeaderRow<any, any>[];
		children?: Snippet;
	}

	let { attrs, rows, children }: Props = $props();
</script>

<thead {...attrs}>
	{#each rows as headerRow (headerRow.id)}
		<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
			<tr class="col-headers" {...rowAttrs}>
				{#each headerRow.cells as cell (cell.id)}
					{@const renderConfig = cell.render()}
					<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
						<th
							{...attrs}
							class={cell.id}
							class:sortable={props.sort && !props.sort.disabled}
							class:sorted={props.sort?.order}
							onclick={() => props.sort?.toggle?.()}
						>
							<!-- this conditional is needed to support header strings that contain HTML entity refs -->
							{#if typeof renderConfig === 'string'}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html renderConfig}
							{:else}
								<Render of={renderConfig} />
							{/if}
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
	{@render children?.()}
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
