<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/state/position-info';
	import { positionTooltips } from 'trade-executor/state/position-tooltips';
	import { SummaryBox, Tooltip } from '$lib/components';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';

	export let position: TradingPositionInfo;
</script>

<SummaryBox title="Other metrics">
	<table class="metrics-table">
		<thead>
			<tr>
				<th>Metric</th>
				<th>Value</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">% of portfolio</span>
						<span slot="popup">
							{positionTooltips.portfolioWeightAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>{formatPercent(position.portfolioWeightAtOpen)}</td>
			</tr>

			<tr>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">Volume</span>
						<span slot="popup">
							{positionTooltips.volume}
						</span>
					</Tooltip>
				</td>
				<td>{formatDollar(position.volume)}</td>
			</tr>

			<tr>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">Fees</span>
						<span slot="popup">
							{positionTooltips.tradingFees}
						</span>
					</Tooltip>
				</td>
				<td>
					{#if position.tradingFees === undefined}
						<Tooltip>
							<span slot="trigger" class="underline">N/A</span>
							<span slot="popup">
								{positionTooltips.tradingFeesMissing}
							</span>
						</Tooltip>
					{:else}
						{formatDollar(position.tradingFees, 4)}
					{/if}
				</td>
			</tr>

			<tr>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">Fees % of volume</span>
						<span slot="popup">
							{positionTooltips.tradingFeesPercent}
						</span>
					</Tooltip>
				</td>
				<td>
					{#if position.tradingFeesPercent === undefined}
						<Tooltip>
							<span slot="trigger" class="underline">N/A</span>
							<span slot="popup">
								{positionTooltips.tradingFeesMissing}
							</span>
						</Tooltip>
					{:else}
						{formatPercent(position.tradingFeesPercent, 4)}
					{/if}
				</td>
			</tr>

			{#if position.stopLossable}
				<tr>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">Stop loss</span>
							<span slot="popup">
								{positionTooltips.stopLossPercentOpen}
							</span>
						</Tooltip>
					</td>
					<td>
						{#if position.stopLossPercentOpen === undefined}
							<Tooltip>
								<span slot="trigger" class="underline">N/A</span>
								<span slot="popup">
									{positionTooltips.stopLossPercentOpenMissing}
								</span>
							</Tooltip>
						{:else}
							<!--
								Stop loss is usually expressed percent of the total position, but
								internally we use the flipped definition as it makes calculations simpler
								-->
							{formatPercent(1 - position.stopLossPercentOpen)}
						{/if}
					</td>
				</tr>

				{#if position.trailing_stop_loss_pct}
					<tr>
						<td>
							<Tooltip>
								<span slot="trigger" class="underline">Trailing stop loss</span>
								<span slot="popup">
									{positionTooltips.trailing_stop_loss_pct}
								</span>
							</Tooltip>
						</td>
						<td>
							{formatPercent(position.trailing_stop_loss_pct)}
						</td>
					</tr>
				{/if}
			{/if}

			{#if !position.isCreditPosition}
				<tr>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">Risk</span>
							<span slot="popup">
								{positionTooltips.portfolioRiskPercent}
							</span>
						</Tooltip>
					</td>
					<td>
						{#if position.portfolioRiskPercent === undefined}
							<Tooltip>
								<span slot="trigger" class="underline"> N/A </span>
								<span slot="popup">
									{positionTooltips.portfolioRiskPercentMissing}
								</span>
							</Tooltip>
						{:else}
							{formatPercent(position.portfolioRiskPercent)}
						{/if}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</SummaryBox>

<style lang="postcss">
	table {
		margin-top: -1rem;
	}
</style>
