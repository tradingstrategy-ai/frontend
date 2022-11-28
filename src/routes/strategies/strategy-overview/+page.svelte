<script>
	import PageHeading from '$lib/components/PageHeading.svelte';
</script>

<main class="strategy-overview ds-container">
	<PageHeading
		title="<h1>QuickSwap momentum</h1>"
		subtitle="<p>This strategy is a test strategy that does not aim to generated profit. The strategy trades on MATIC/USDC pairs on QuickSwap. The strategy rebalances every 16 hours to generate maximum amount of data. Based on 4h candles, the strategy calculates the momentum and picks highest gainers. The portfolio can hold 6 positions at once.</p>"
	/>
	<div class="tabs">
		<input id="overview-tab-trigger" type="radio" checked name="strategy-overview" />
		<label for="overview-tab-trigger"> Overview </label>
		<input id="open-positions-tab-trigger" type="radio" name="strategy-overview" />
		<label for="open-positions-tab-trigger"> Open positions </label>
		<div class="tab" id="overview-tab">
			<!-- todo — componentize this -->
			<div class="strategy-overview__overview">
				<section class="strategy-overview-box current-assets">
					<h3>Current assets</h3>
					<div class="strategy-overview-box-detail">
						<span class="strategy-overview-box-detail__label"> Value in trading positions </span>
						<span class="strategy-overview-box-detail__value"> $132.60 </span>
					</div>
					<div class="strategy-overview-box-detail">
						<span class="strategy-overview-box-detail__label"> Cash </span>
						<span class="strategy-overview-box-detail__value"> $100.12 </span>
					</div>
					<div class="strategy-overview-box-detail">
						<span class="strategy-overview-box-detail__label"> Last valuation </span>
						<span class="strategy-overview-box-detail__value"> 23 minutes ago </span>
					</div>
				</section>
				<section class="strategy-overview-box performance">
					<h3>Performance</h3>
					<div class="strategy-overview-box-detail">
						<span class="strategy-overview-box-detail__label"> Value in trading positions </span>
						<span class="strategy-overview-box-detail__value"> $132.60 </span>
					</div>
					<div class="strategy-overview-box-detail">
						<span class="strategy-overview-box-detail__label"> Cash </span>
						<span class="strategy-overview-box-detail__value"> $100.12 </span>
					</div>
					<div class="strategy-overview-box-detail">
						<span class="strategy-overview-box-detail__label"> Last valuation </span>
						<span class="strategy-overview-box-detail__value"> 23 minutes ago </span>
					</div>
				</section>
			</div>
		</div>
		<div class="tab" id="open-positions-tab">dh'd;kh;klsdnmjh</div>
	</div>
</main>

<style>
	:global(.page-heading p) {
		font: var(--f-ui-md-medium) !important;
	}

	input {
		display: none;
	}

	input:checked + label {
		background: var(--c-background-4);
		color: var(--c-text);
	}

	label {
		border-radius: 1.25rem;
		color: var(--c-text-extra-light);
		cursor: pointer;
		padding: 1rem;
		font: var(--f-ui-lg-medium);
	}

	input:nth-of-type(1):checked ~ .tab:not(:nth-of-type(1)) {
		display: none !important;
	}

	input:nth-of-type(2):checked ~ .tab:not(:nth-of-type(2)) {
		display: none !important;
	}

	.tabs {
		padding: 1.25rem 0;
	}

	.strategy-overview__overview {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(auto-fit, minmax(16rem, auto));
		padding-top: 1.25rem;
	}

	.strategy-overview-box {
		background: var(--c-background-5);
		border-radius: 1.25rem;
		display: grid;
		gap: 1.5rem;
		padding: 1.625rem;
	}

	.strategy-overview-box h3 {
		font: var(--f-ui-xxl-medium);
	}

	.strategy-overview-box-detail {
		border-radius: 1.25rem;
		background: var(--c-background-4);
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
	}

	.strategy-overview-box-detail__label {
		color: var(--c-text-light);
		font: var(--f-ui-md-medium);
	}

	.strategy-overview-box-detail__value {
		font: var(--f-ui-xxxl-medium);
	}

	@media all and (max-width: 1024px) {
		label {
			font: var(--f-ui-md-medium);
			padding: 0.5rem;
		}

		.strategy-overview__overview {
			gap: 1.5rem;
		}

		.strategy-overview-box {
			gap: 1rem;
			padding: 1rem;
		}

		.strategy-overview-box h3 {
			font: var(--f-ui-lg-medium);
		}

		.strategy-overview-box-detail {
			gap: 0.5rem;
			padding: 1.25rem;
		}

		.strategy-overview-box-detail__label {
			font: var(--f-ui-md-medium);
		}

		.strategy-overview-box-detail__value {
			font: var(--f-ui-xl-medium);
		}
	}
</style>
