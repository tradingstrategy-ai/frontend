<script lang="ts">
	import type { PaginationState } from 'svelte-headless-table/plugins';
	import { formatAmount } from '$lib/helpers/formatters';
	import PageButton from './PageButton.svelte';

	export let page: PaginationState;
	export let totalRowCount: number;

	const { pageSize, pageIndex, pageCount, hasPreviousPage, hasNextPage } = page;

	$: firstRowIndex = $pageIndex * $pageSize + 1;
	$: lastRowIndex = Math.min(firstRowIndex + $pageSize - 1, totalRowCount);
	$: visiblePageIndices = getVisiblePageIndices($pageCount, $pageIndex);

	// Click handler is attached to top-level pagination element,
	// handles propogated events from decendent button elements
	function handlePageButtonClick({ target }: MouseEvent) {
		if (!(target instanceof HTMLButtonElement)) return;
		const index = parseInt(target.value);
		if (Number.isFinite(index)) {
			$pageIndex = index;
		}
	}

	function getVisiblePageIndices(length: number, index: number) {
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
					Showing {formatAmount(firstRowIndex)} to {formatAmount(lastRowIndex)} of {formatAmount(totalRowCount)}
				</div>
				{#if $pageCount > 1}
					<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
					<nav on:click={handlePageButtonClick}>
						<PageButton label="Previous" value={$pageIndex - 1} disabled={!$hasPreviousPage} />
						{#each visiblePageIndices as pageIdx}
							{#if hasPageIndexGap(pageIdx)}
								<span class="gap-indicator">…</span>
							{/if}
							<PageButton active={$pageIndex === pageIdx} label={formatAmount(pageIdx + 1)} value={pageIdx} />
						{/each}
						<PageButton label="Next" value={$pageIndex + 1} disabled={!$hasNextPage} />
					</nav>
				{/if}
			</div>
		</td>
	</tr>
</tfoot>

<style>
	td {
		height: 4.5rem;
		padding: 0;
	}

	.data-table-pagination {
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

		nav {
			display: flex;

			&:hover .gap-indicator {
				color: var(--c-text-extra-light);
			}
		}
	}
</style>
