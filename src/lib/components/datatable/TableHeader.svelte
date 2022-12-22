<script lang="ts">
	import type { HeaderRow } from 'svelte-headless-table';
	import { Subscribe, Render } from 'svelte-headless-table';

	export let attrs: svelte.JSX.HTMLAttributes<HTMLElementTagNameMap['thead']>;
	export let rows: HeaderRow<any, any>[];
</script>

<thead {...attrs}>
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
	thead {
		position: sticky;
		top: 0;
	}

	th {
		padding: var(--space-md) var(--space-ls);
		background-color: var(--c-body);
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-medium, normal);
		white-space: nowrap;

		&.sortable {
			cursor: pointer;
		}

		&.sorted {
			padding: 1rem 2rem 1rem 1.25rem;
		}
	}

	.sorting-indicator {
		position: absolute;
		transform: translate(0.5rem);
	}
</style>
