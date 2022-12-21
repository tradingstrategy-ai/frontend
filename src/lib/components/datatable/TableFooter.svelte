<script lang="ts">
	export let currentPage: number = 1;
	export let threshold: number = 10;
	export let totalEntriesNumber: number;

	$: totalPagesNumber = Math.round(totalEntriesNumber / threshold);
</script>

<tfoot>
	<tr>
		<td colspan="100">
			<div class="data-table-pagination">
				<div class="status">
					<span>Showing</span>
					<span class="first-page-entry-number">{currentPage}</span>
					<span>to</span>
					<span class="last-page-entry-number">{threshold + currentPage - 1}</span>
					<span>of</span>
					<span class="total-entries-number">{totalEntriesNumber}</span>
				</div>
				<nav>
					<button disabled={currentPage === 1}>Previous</button>
					<button>1</button>
					<button>2</button>
					<button>3</button>
					<button>4</button>
					<button>5</button>
					<button disabled>...</button>
					<span class="total-pages-number">{totalPagesNumber}</span>
					<button disabled={currentPage === totalEntriesNumber}>Next</button>
				</nav>
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
	}

	nav {
		cursor: pointer;
	}

	nav:hover button {
		color: var(--c-text-ultra-light);
	}

	button {
		background: none;
		border: none;
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		padding: none;
		transition: color var(--time-xs) ease-out;

		&[disabled] {
			color: var(--c-text-ultra-light) !important;
			cursor: not-allowed;
		}

		&:not([disabled]):hover {
			color: var(--c-text) !important;
		}
	}
</style>
