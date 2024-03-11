<script lang="ts">
	import { SummaryBox } from '$lib/components';

	export let data;
	const { strategy } = data;

	const isEnzymeVault = strategy.on_chain_data.asset_management_mode === 'enzyme';
</script>

<section class="fees">
	<SummaryBox title="Fees">
		<table class="datatable">
			<tbody>
				<tr>
					<td>Management fee</td>
					<td>0.0%</td>
				</tr>
				<tr>
					<td>Performance fee</td>
					<td>0.0%</td>
				</tr>
				<tr>
					<td>Trading Strategy Protocol fee</td>
					<td>0.0%</td>
				</tr>
				{#if isEnzymeVault}
					<tr>
						<td>Enzyme Protocol fee</td>
						<td>0.1%</td>
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
	}
</style>
