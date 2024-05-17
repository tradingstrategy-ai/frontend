<script lang="ts">
	import { Icon, SummaryBox, Tooltip } from '$lib/components';

	export let data;
	const { strategy } = data;

	const hasEnzymeVault = strategy.on_chain_data.asset_management_mode === 'enzyme';
	const enzymeFeeUrl = 'https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting';
</script>

<svelte:head>
	<title>Fees | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Trading fee information for {strategy.name} strategy" />
</svelte:head>

<section class="fees">
	<SummaryBox title="Fees">
		<table class="datatable">
			<tbody>
				<tr>
					<td>Management fee</td>
					<td>0.00%</td>
				</tr>
				<tr>
					<td>Performance fee</td>
					<td>0.00%</td>
				</tr>
				<tr>
					<td>Trading Strategy Protocol fee</td>
					<td>0.00%</td>
				</tr>
				{#if hasEnzymeVault}
					<tr>
						<td>
							<Tooltip>
								<span slot="trigger">
									Enzyme Protocol fee
									<Icon name="question-circle" />
								</span>
								<div slot="popup">
									<p>
										The Enzyme protocol fee rate applied to the vault is 0.50%. Shares accrued can be bought back with
										MLN at a 50% discount, leading to an effective protocol fee rate of 0.25%.
									</p>
									<p>
										<a href={enzymeFeeUrl} target="_blank" rel="noreferrer">Read more</a>
										about Enzyme protocol fees.
									</p>
								</div>
							</Tooltip>
						</td>
						<td>0.25%</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</SummaryBox>

	<SummaryBox title="Beta info">
		<p class="beta-info">During the beta Trading Strategy does not charge any fees.</p>
	</SummaryBox>
</section>

<style lang="postcss">
	.fees {
		display: grid;
		grid-template-columns: 8fr minmax(18rem, 5fr);
		gap: 1.25rem;
		align-items: flex-start;

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}

		.datatable {
			@media (width <= 920px) {
				--table-font: var(--f-ui-sm-medium) !important;
				--table-letter-spacing: var(--f-ui-sm-spacing, normal) !important;
				--cell-padding: var(--space-ss) var(--space-md);
				--body-cell-height: 2.875rem;
			}

			td:last-child {
				text-align: right;
			}
		}

		p.beta-info {
			@media (--viewport-md-down) {
				font: var(--f-ui-md-roman);
				letter-spacing: var(--ls-ui-md);
			}
		}

		[slot='trigger'] {
			display: flex;
			gap: 0.75ex;
			align-items: center;
		}

		[slot='popup'] p {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md-roman);
		}
	}
</style>
