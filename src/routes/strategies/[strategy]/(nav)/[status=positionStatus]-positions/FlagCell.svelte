<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/state/position-info';
	import type { TradeInfo } from 'trade-executor/state/trade-info';
	import PositionFlag from './PositionFlag.svelte';

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
				<li><a href="${getTradeLink(position.stopLossTrades.at(-1))}">View the closing trade</a></li>
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
				<li><a href="${getTradeLink(position.failedTrades.at(-1))}">View the last failed trade</a></li>
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
