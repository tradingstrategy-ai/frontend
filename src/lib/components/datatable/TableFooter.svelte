<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import PageButton from './PageButton.svelte';

	// type declaration not exported from svelte-headless-tables; see:
	// https://github.com/bryanmylee/svelte-headless-table/blob/main/src/lib/plugins/addPagination.ts
	interface PaginationState {
		pageSize: Writable<number>;
		pageIndex: Writable<number>;
		pageCount: Readable<number>;
		hasPreviousPage: Readable<boolean>;
		hasNextPage: Readable<boolean>;
	}

	export let page: PaginationState;
	export let totalRowCount: number;

	const { pageSize, pageIndex, pageCount, hasPreviousPage, hasNextPage } = page;

	$: firstRowIndex = $pageIndex * $pageSize + 1;
	$: lastRowIndex = Math.min(firstRowIndex + $pageSize - 1, totalRowCount);
	$: visiblePageIndices = getVisibilePageIndices($pageCount, $pageIndex);

	function handlePageButtonClick({ target }: { target: HTMLButtonElement }) {
		const index = parseInt(target.value);
		if (Number.isFinite(index)) {
			$pageIndex = index;
			const table = target.closest('table');
			if (table && table.getBoundingClientRect().y < 0) {
				table.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}

	function getVisibilePageIndices(length: number, index: number) {
		const max = length - 1;
		const startThreshold = 4;
		const endThreshold = max - startThreshold;
		return [...Array(length).keys()].filter((i) => {
			if (length <= 7) return true;
			if (i === 0 || i === max) return true;
			if (i >= index - 1 && i <= index + 1) return true;
			if (index < startThreshold && i <= startThreshold) return true;
			if (index > endThreshold && i >= endThreshold) return true;
			return false;
		});
	}

	function hasPageIndexGap(current: number) {
		const index = visiblePageIndices.indexOf(current);
		const previous = visiblePageIndices[index - 1];
		return Number.isFinite(previous) && current - previous !== 1;
	}
</script>

<tfoot>
	<tr>
		<td colspan="100">
			<div class="data-table-pagination">
				<div class="status">
					Showing {firstRowIndex} to {lastRowIndex} of {totalRowCount}
				</div>
				{#if $pageCount > 1}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<nav on:click={handlePageButtonClick}>
						<PageButton label="Previous" value={$pageIndex - 1} disabled={!$hasPreviousPage} />
						{#each visiblePageIndices as pageIdx}
							{#if hasPageIndexGap(pageIdx)}
								<span class="gap-indicator">…</span>
							{/if}
							<PageButton label={pageIdx + 1} value={pageIdx} disabled={$pageIndex === pageIdx} />
						{/each}
						<PageButton label="Next" value={$pageIndex + 1} disabled={!$hasNextPage} />
					</nav>
				{/if}
			</div>
		</td>
	</tr>
</tfoot>

<style lang="postcss">
	td {
		height: 4.5rem;
		padding: 0;
	}

	.data-table-pagination {
		color: var(--c-text-light);
		display: flex;
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		justify-content: space-between;
		width: 100%;

		@media (--viewport-sm-down) {
			display: grid;
			gap: var(--space-md);
			left: 0;
			place-items: center;
			place-content: center;
			padding: var(--space-xl) var(--space-sm);
			position: sticky;
			max-width: calc(100vw - 3 * var(--space-md));
		}

		& nav {
			display: flex;

			&:hover .gap-indicator {
				color: var(--c-text-ultra-light);
			}
		}
	}
</style>
