<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/state/position-info';
	import type { TradeInfo } from 'trade-executor/state/trade-info';
	import { Alert } from '$lib/components';
	import PositionFlag from './PositionFlag.svelte';
	import { formatNumber, formatPercent } from '$lib/helpers/formatters';

	export let admin = false;
	export let position: TradingPositionInfo;
	export let baseUrl: string;

	function getTradeLink(trade: TradeInfo) {
		return `${baseUrl}/trade-${trade.trade_id}`;
	}
</script>

<div class="flags">
	{#if position.stopLossTriggered}
		<PositionFlag label="SL" title="Stop loss triggered">
			<p>This position was closed with a stop loss</p>
			<p>Position can still have a profitable close if a trailing or dynamic stop loss was used.</p>
			<p>See more</p>
			<ul>
				<li><a href={getTradeLink(position.stopLossTrades.at(-1))}>View the closing trade</a></li>
				<li><a href="/glossary/stop-loss">What is a stop loss</a></li>
			</ul>
		</PositionFlag>
	{/if}

	{#if position.hasFailedTrades}
		<PositionFlag status="warning" label="F" title="Failed trades">
			<p>This position contains failed trades.</p>
			<p>Trades may fail for various reasons</p>
			<ul>
				<li>
					Blockchain transaction execution fails due to
					<a href="https://tradingstrategy.ai/glossary/gas-fee">gas fees spiking</a>
				</li>
				<li>
					The market was moving too fast and trade failed due to
					<a href="https://tradingstrategy.ai/glossary/slippage">slippage tolerance exceeded</a>
					during the trade execution
				</li>
				<li>Blockchain nodes or blockchain network malfunctioning</li>
				<li>Internal technical issues</li>
			</ul>
			<p>
				Depending on the failure condition, the trade may or may not need manual intervention. Each failed trade has a
				corresponding repair trade marked with <i>R</i> flag.
			</p>
			<p>See more</p>
			<ul>
				<li><a href={getTradeLink(position.failedTrades.at(-1))}>View the last failed trade</a></li>
			</ul>
		</PositionFlag>
	{/if}

	{#if admin && position.hasInconsistentProfitability}
		<PositionFlag status="warning" label="P" title="Profitability data inconsistent">
			<p>
				<Alert size="xs" status="info" title="Note">This info is only displayed to admin users.</Alert>
			</p>
			<p>
				This position has inconsistent profitability data. The value from position stats does not match the result of
				comparing all entry and exit trades.
			</p>
			<ul>
				<li>Profitability value from position stats: <strong>{formatPercent(position.profitability, 2)}</strong></li>
				<li>
					Profitability value from entry/exit trades:
					<strong>{formatPercent(position.profitabilityFromTradeTotals, 2)}</strong>
					<ul>
						<li>sum of entry trades: <strong>${formatNumber(position.totalEnteredValue)}</strong></li>
						<li>sum of exit trades: <strong>${formatNumber(position.totalExitedValue)}</strong></li>
						<li>
							(${formatNumber(position.totalExitedValue)} - ${formatNumber(position.totalEnteredValue)})
							{#if position.isShortPosition}&times; -1{/if}
							/ ${formatNumber(position.totalEnteredValue)} =
							<strong>{formatPercent(position.profitabilityFromTradeTotals, 2)}</strong>
						</li>
					</ul>
				</li>
			</ul>
		</PositionFlag>
	{/if}
</div>

<style lang="postcss">
	.flags {
		white-space: nowrap;
		display: flex;
		gap: 0.5em;

		:global(.tooltip .popup) {
			min-width: 32rem;
		}
	}
</style>
