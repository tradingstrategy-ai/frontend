<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/models/position-info';
	import type { TradeInfo } from 'trade-executor/models/trade-info';
	import { Alert } from '$lib/components';
	import PositionFlag from './PositionFlag.svelte';
	import { formatNumber, formatPercent } from '$lib/helpers/formatters';

	interface Props {
		admin?: boolean;
		position: TradingPositionInfo;
		baseUrl: string;
		isHidden?: boolean;
	}

	let { admin = false, position, baseUrl, isHidden = false }: Props = $props();

	function getTradeLink({ trade_id }: TradeInfo) {
		return `${baseUrl}/trade-${trade_id}`;
	}
</script>

<div class="flags">
	{#if position.stopLossTriggered}
		<PositionFlag label="SL" title="Stop loss triggered">
			<p>This position was closed with a stop loss</p>
			<p>Position can still have a profitable close if a trailing or dynamic stop loss was used.</p>
			<p>See more</p>
			<ul>
				<li><a href={getTradeLink(position.lastTrade!)}>View the closing trade</a></li>
				<li><a href="/glossary/stop-loss">What is a stop loss</a></li>
			</ul>
		</PositionFlag>
	{/if}

	{#if position.hasFailedTrades}
		<PositionFlag status="warning" label="I" title="Issues">
			<p>This position includes trades that encountered transaction issues.</p>
			<p>Transaction issues may occur for various reasons</p>
			<ul>
				<li>
					Blockchain transaction execution fails due to
					<a href="https://tradingstrategy.ai/glossary/gas-fee">gas fees spiking</a>
				</li>
				<li>
					The market was moving too fast and the transaction failed due to
					<a href="https://tradingstrategy.ai/glossary/slippage">slippage tolerance exceeded</a>
					during execution
				</li>
				<li>Blockchain nodes or blockchain network malfunctioning</li>
				<li>Internal technical issues</li>
			</ul>
			<p>
				Depending on the issue, the transaction may or may not need manual intervention. Some transactions with issues
				have corresponding repair transactions marked with <i>R</i> flag.
			</p>
			<p>See more</p>
			<ul>
				<li><a href={getTradeLink(position.failedTrades.at(-1)!)}>View the last trade with issues</a></li>
			</ul>
		</PositionFlag>
	{/if}

	{#if admin && position.hasInconsistentProfitability}
		<PositionFlag status="warning" label="P" title="Profitability data inconsistent">
			<Alert size="xs" status="info" title="Note">This info is only displayed to admin users.</Alert>
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

	{#if admin && isHidden}
		<PositionFlag status="warning" label="H" title="Hidden position">
			<p>
				<Alert size="xs" status="info" title="Note">This info is only displayed to admin users.</Alert>
			</p>
			<p>This position is hidden from non-admin users.</p>
			<p>
				Hidden positions are configured in <code>frontend</code> strategy configuration (on production, in the
				<code>strategy.json</code> config file).
			</p>
		</PositionFlag>
	{/if}
</div>

<style>
	.flags {
		white-space: nowrap;
		display: flex;
		gap: 0.5em;

		:global(.tooltip .popup) {
			min-width: 32rem;
		}

		code {
			font-family: var(--ff-mono);
			font-size: 1em;
			font-weight: 600;
			color: var(--c-text-light);
			background: color-mix(in srgb, transparent, gray 20%);
			padding-inline: 0.5em;
			border-radius: var(--radius-xs);
		}
	}
</style>
