<script>
	/**
	 * @typedef {{label: string; value: string;}[]} StrategyOverviewSummaryItemDetails
	 * @property  details
	 * @property {string} title
	 */

	/** @type {StrategyOverviewSummaryItemDetails}*/
	export let details = [];
	/** @type {string} */
	export let title = '';
</script>

<section>
	<h3>{title}</h3>
	{#each details as detail}
		<div>
			<span class="label"> {detail.label} </span>
			<span class="value"> {detail.value} </span>
		</div>
	{/each}
</section>

<style>
	section {
		background: var(--c-background-5);
		border-radius: 1.25rem;
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem 1.25rem;
	}

	h3 {
		font: var(--f-ui-xl-medium) !important;
	}

	div {
		border-radius: 1.25rem;
		background: var(--c-background-4);
		display: grid;
		gap: 0.5rem;
		padding: 1.25rem;
	}

	.label {
		color: var(--c-text-light);
		font: var(--f-ui-md-medium);
	}

	.value {
		font: var(--f-ui-xxxl-medium);
	}

	@media all and (max-width: 1024px) {
		section {
			gap: 1rem;
			padding: 1.5rem 1.25rem;
		}

		div {
			gap: 0.5rem;
			padding: 1.25rem;
		}

		.label {
			font: var(--f-ui-md-medium);
		}

		.value {
			font: var(--f-ui-xl-medium);
		}
	}
</style>
