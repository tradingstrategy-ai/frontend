<script lang="ts">
	import TimePeriodSummaryColumn from './TimePeriodSummaryColumn.svelte';

	export let pairId: string;

	let activeColumn = 'daily';
</script>

<div>
	<ul class="row-heading">
		<li class="col-heading" />
		<li>Change</li>
		<li>Open</li>
		<li>Highest</li>
		<li>Lowest</li>
		<li>Close</li>
		<li>Volume</li>
		<li>Highest liquidity</li>
		<li>Lowest liquidity</li>
		<li>Buying trades</li>
		<li>Selling trades</li>
	</ul>

	{#each ['hourly', 'daily', 'weekly', 'monthly'] as period}
		<TimePeriodSummaryColumn {pairId} {period} active={period === activeColumn} />
	{/each}
</div>

<style lang="postcss">
	div {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 1rem;
		overflow: hidden;

		@media (--viewport-sm-down) {
			grid-template-columns: 3fr 2fr;
			grid-auto-columns: 0;
		}
	}

	div :global ul {
		list-style-type: none;
		padding: 0;
		display: grid;
		gap: 1rem;
		grid-auto-rows: auto;

		& > li {
			font: 400 var(--fs-ui-xl);
			height: 1.4em;
			white-space: nowrap;

			&.col-heading {
				font: var(--f-h4-medium);

				@media (--viewport-sm-down) {
					display: none;
				}
			}
		}

		&.row-heading li {
			font-weight: 500;
		}

		@media (--viewport-sm-down) {
			&:not(.active):not(.row-heading) {
				display: none;
			}
		}
	}
</style>
