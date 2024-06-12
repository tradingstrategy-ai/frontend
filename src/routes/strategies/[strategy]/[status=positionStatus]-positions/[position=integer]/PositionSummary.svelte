<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/state/position-info';
	import { Timestamp, Tooltip } from '$lib/components';
	import { formatDuration, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { formatTokenAmount } from 'trade-executor/helpers/formatters';

	export let position: TradingPositionInfo;

	const priceProp = position.stillOpen ? 'currentPrice' : 'closePrice';
</script>

<div class="position-summary">
	<h2>Position Summary</h2>

	<table>
		<thead>
			<tr>
				<th></th>
				<th>Open</th>
				<th>Close</th>
				<th>𝚫</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Time</td>
				<td>
					<Tooltip>
						<span slot="trigger">
							<Timestamp date={position.opened_at} withTime />
						</span>
						<span slot="popup">
							{position.tooltip.opened_at}
						</span>
					</Tooltip>
				</td>
				<td>
					{#if position.stillOpen}
						currently open
					{:else}
						<Tooltip>
							<span slot="trigger">
								<Timestamp date={position.closed_at} withTime />
							</span>
							<span slot="popup">
								{position.tooltip.closed_at}
							</span>
						</Tooltip>
					{/if}
				</td>
				<td>
					<Tooltip>
						<span slot="trigger">
							{formatDuration(position.durationSeconds)}
						</span>
						<span slot="popup">
							{position.tooltip.durationSeconds}
						</span>
					</Tooltip>
				</td>
			</tr>

			<tr>
				<td>Quantity</td>
				<td>
					<Tooltip>
						<span slot="trigger">
							{formatTokenAmount(position.quantityAtOpen)}
							{position.pair.actionSymbol}
						</span>
						<span slot="popup">
							{position.tooltip.quantityAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>
					<Tooltip>
						<span slot="trigger">
							{formatTokenAmount(position.quantityAtOpen)}
							{position.pair.actionSymbol}
						</span>
						<span slot="popup">
							{position.tooltip.quantityAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>---</td>
			</tr>

			{#if position.isCreditPosition}
				<tr>
					<td>Interest rate</td>
					<td>
						{formatPercent(position.interestRateAtOpen)}
					</td>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">N/A</span>
							<span slot="popup">Closing interest rate not currently available.</span>
						</Tooltip>
					</td>
					<td>---</td>
				</tr>
			{:else}
				<tr>
					<td>Price</td>
					<td>
						<Tooltip>
							<span slot="trigger">
								{formatPrice(position.openPrice)}
							</span>
							<span slot="popup">
								{position.tooltip.openPrice}
							</span>
						</Tooltip>
					</td>
					<td>
						<Tooltip>
							<span slot="trigger">
								{formatPrice(position[priceProp])}
							</span>
							<span slot="popup">
								{position.tooltip[priceProp]}
							</span>
						</Tooltip>
					</td>
					<td>
						{formatPrice(position[priceProp] - position.openPrice)}
					</td>
				</tr>
			{/if}

			<tr>
				<td>Value</td>
				<td>
					<Tooltip>
						<span slot="trigger">
							<span>{formatPrice(position.valueAtOpen)}</span>
						</span>
						<span slot="popup">
							{position.tooltip.valueAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>
					<Tooltip>
						<span slot="trigger">
							<span>{formatPrice(position.valueAtClose)}</span>
						</span>
						<span slot="popup">
							{position.tooltip.valueAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>
					{formatPrice(position.valueAtClose - position.valueAtOpen)}
				</td>
			</tr>
		</tbody>
	</table>
</div>

<style lang="postcss">
	.position-summary {
		h2 {
			font: var(--f-heading-md-medium);
		}

		table {
			width: 100%;
			border-collapse: collapse;
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md);

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm);
			}

			:is(th, td) {
				padding: 0.625rem;

				&:first-child {
					text-align: left;
				}

				&:not(first-child) {
					text-align: right;
				}
			}

			thead {
				color: var(--c-text-extra-light);

				th {
					padding-bottom: 1em;
					font-size: 0.875em;
				}
			}

			tbody {
				border-block: 2px solid var(--c-text-ultra-light);

				/* zebra-striped rows */
				tr:nth-child(even) {
					background: var(--c-box-2);
				}

				td:first-child {
					font-size: 0.875em;
					font-weight: 500;
					color: var(--c-text-light);
				}
			}
		}
	}
</style>
