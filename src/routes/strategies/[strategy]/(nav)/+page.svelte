<script lang="ts">
	export let data;
	$: ({ chain, summary, state } = data);
</script>

<svelte:head>
	<title>{summary.name} | Trading Strategy</title>
	<meta name="description" content={summary.long_description} />
</svelte:head>

<div class="strategy-overview-page">
	<div class="deposit-widget">Deposit widget</div>
	<div class="chart">Chart</div>
	<div class="metrics">Metrics</div>
	<div class="description">Strategy description</div>
</div>

<style lang="postcss">
	.strategy-overview-page {
		display: grid;
		gap: 1rem;

		/* Desktop 2 column layout */
		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 1fr auto;

			/* move deposit widget to row 2, col 2 */
			.deposit-widget {
				grid-area: 2 / 2;
			}

			/* chart and description span full row width */
			:is(.chart, .description) {
				grid-column: 1 / -1;
			}
		}

		/* Placeholder styling - remove once real elements all added */
		> * {
			border-radius: var(--radius-md);
			padding: 1.5rem;
			background: hsl(var(--hsla-box-1));
			font: var(--f-heading-sm-medium);
			color: hsl(var(--hsl-text-extra-light));
		}
		.chart {
			height: 18rem;
		}
		.metrics {
			height: 15rem;
		}
		.deposit-widget {
			min-width: 18rem;
		}
		.description {
			height: 10rem;
		}
	}
</style>
