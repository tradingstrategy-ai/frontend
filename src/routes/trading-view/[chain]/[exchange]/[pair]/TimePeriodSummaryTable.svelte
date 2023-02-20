<!--
@component
Display summary performance table for various periods.

#### Usage:
```tsx
	<TimePeriodSummaryTable pairId={1234} exchangeType="uniswap_v2" />
```
-->
<script lang="ts">
	import TimePeriodSummaryColumn from './TimePeriodSummaryColumn.svelte';
	import TimePeriodPicker from './TimePeriodPicker.svelte';
	import { UpDownIndicator } from '$lib/components';
	import { formatPriceChange } from '$lib/helpers/formatters';

	export let pairId: number | string;
	export let hideLiquidityAndTrades = false;

	let selected = 'daily';
</script>

<div class="time-period-summary-table">
	<div class="time-period-picker">
		<TimePeriodPicker bind:selected />
	</div>

	<div class="table-wrapper">
		<table>
			<colgroup>
				<col class="labels" />
				<col />
				<col />
				<col />
				<col />
			</colgroup>

			<thead>
				<tr>
					<th />
					<th class="right" scope="col">Hourly</th>
					<th class="right" scope="col">Daily</th>
					<th class="right" scope="col">Weekly</th>
					<th class="right" scope="col">Monthly</th>
				</tr>
			</thead>

			<tbody>
				<tr>
					<th scope="row">Change</th>
					<td class="right">
						<span>
							<UpDownIndicator formatter={formatPriceChange} value={-0.02} />
						</span>
					</td>
					<td class="right">
						<span>
							<UpDownIndicator formatter={formatPriceChange} value={0.124} />
						</span>
					</td>
					<td class="right">
						<span>
							<UpDownIndicator formatter={formatPriceChange} value={0.124} />
						</span>
					</td>
					<td class="right">
						<span>
							<UpDownIndicator formatter={formatPriceChange} value={5.07} />
						</span>
					</td>
				</tr>

				<tr>
					<th scope="row"> Open </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Highest </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Lowest </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Close </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Volume </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Highest liquidity </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Lowest liquidity </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Buying trades </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>

				<tr>
					<th scope="row"> Selling trades </th>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.05</td>
					<td class="right">$0.00863</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style lang="postcss">
	.time-period-picker {
		position: sticky;
		left: 0;
		top: 0;

		@media (--viewport-lg-up) {
			display: none;
		}
	}

	.time-period-summary-table {
		overflow-x: auto;
		overflow-y: hidden;
	}

	td span {
		display: grid;
		justify-items: end;
	}

	tbody th {
		max-width: 6rem;
	}

	.time-period-table :global {
		display: grid;
		grid-template-columns: 3fr 2fr;
		overflow: hidden;

		@media (--viewport-lg-up) {
			grid-template-columns: repeat(5, 1fr);
		}

		& ul {
			list-style-type: none;
			padding: 0;
			display: grid;
		}

		& li {
			--skeleton-width: 5ch;
			--skeleton-height: 1.2em;
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
			white-space: nowrap;
			padding-inline: var(--space-ss);

			&.col-heading {
				height: 1.4em;
				font: var(--f-h4-medium);
				text-transform: capitalize;

				@media (--viewport-md-down) {
					display: none;
				}
			}

			&:not(.col-heading) {
				padding-block: var(--space-sl);

				@media (--viewport-md-up) {
					padding-block: var(--space-md);

					&:not(:last-child) {
						border-bottom: 1px solid var(--c-border-1-v1);
					}
				}
			}
		}

		& .row-heading li {
			font-weight: 500;
			padding-inline: 0;
		}

		& .loading li.col-heading {
			color: var(--c-text-7-v1);
		}

		& .time-period-col:not(.active) {
			@media (--viewport-md-down) {
				display: none;
			}
		}
	}
</style>
