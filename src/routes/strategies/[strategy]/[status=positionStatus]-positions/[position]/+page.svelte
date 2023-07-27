<script lang="ts">
	import { getPositionLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatProfitability, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitability } from 'trade-executor-frontend/helpers/profit';
	import {
		getValueAtOpen,
		getValueAtPeak,
		getValueAtClose,
		getPositionFreezeReason,
		isPositionInError
	} from 'trade-executor-frontend/state/position-helpers';
    import {formatDuration, formatPercent, formatPrice} from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain-explorer';
	import { tradeDirection } from 'trade-executor-frontend/helpers/trade';
    import {
      Alert,
      Badge,
      DataBox,
      DataBoxes,
      HashAddress,
      PageHeading,
      Timestamp,
      UpDownIndicator
    } from '$lib/components';
	import TradeTable from './TradeTable.svelte';
	import StopLossIndicator from './StopLossIndicator.svelte';
    import type {TradingPositionInfo} from "./position-data";
    import type {State, TradingPosition} from "trade-executor-frontend/state/interface";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import {positionInfoDescription} from "./position-data";

    /** @type {import('./$types').PageData} */
	export let data;

    // TODO: Is there any way to make IDE to pick these types smartly?
    let summary = data.summary;
    let state: State = data.state;
    let position: TradingPosition = data.position;
    let chain = data.state;
    let positionInfo: TradingPositionInfo = data.positionInfo;

	const currentStats = getPositionLatestStats(position.position_id, state.stats);
	const positionStats = state.stats.positions[position.position_id];
	const trades = Object.values(position.trades);
	const positionFailed = isPositionInError(position);
	const positionErrorInfo = positionFailed && getPositionFreezeReason(position);


</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1><a href="/strategies/{summary.id}">{summary.name}</a></h1>
		<h2>Position #{position.position_id}</h2>
	</PageHeading>

	<section>
		{#if positionErrorInfo}
			<Alert size="md" status="error" title="This position is currently in an error state">
				<ul class="error-details">
					<li>Failure reason: <i>{positionErrorInfo.revertReason}</i></li>
					<li>
						<a href={`./${position.position_id}/trade-${positionErrorInfo.tradeId}`}
							>View failed trade #{positionErrorInfo.tradeId}</a
						>
					</li>
					<li>
						<a href={getExplorerUrl(chain, positionErrorInfo.txHash)} target="_blank" rel="noreferrer">
							View transaction
							<span class="hash-wrapper">
								<HashAddress address={positionErrorInfo.txHash} />
							</span>
						</a>
					</li>
				</ul>
			</Alert>
		{/if}

		<DataBoxes>
			<DataBox label="Pair">
				<a href={position.pair.info_url}>
					{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
				</a>
			</DataBox>

			<DataBox label="Profitability">
                <Tooltip>
                    <p slot="tooltip-trigger" class="tooltip-trigger-value">
                        <UpDownIndicator
                            value={positionInfo.profitability}
                            formatter={formatProfitability}
                            compareFn={determineProfitability}
                        />
                    </p>
                    <span slot="tooltip-popup">
                        {#if positionInfo.stillOpen}
                            {positionInfoDescription.unrealisedProfitability}
                        {:else}
                            {positionInfoDescription.realisedProfitability}
                        {/if}
                    </span>
                </Tooltip>

                {#if positionInfo.stopLossTriggered}
                    <Tooltip>
                        <p slot="tooltip-trigger" class="tooltip-trigger-value">
                            <StopLossIndicator />
                        </p>
                        <span slot="tooltip-popup">
                            {positionInfoDescription.stopLossTriggered}
                        </span>
                    </Tooltip>
                {/if}
			</DataBox>

			<DataBox label="Time">

                    <Tooltip>
                        <p slot="tooltip-trigger" class="tooltip-trigger-value">
                            <Timestamp date={positionInfo.openedAt} format="iso" withTime />
                            {#if !positionInfo.stillOpen}
                                —
                            {/if}
                        </p>
                        <span slot="tooltip-popup">
                            {positionInfoDescription.openedAt}
                        </span>
                    </Tooltip>

                    {#if !positionInfo.stillOpen}
                        <Tooltip>
                            <p slot="tooltip-trigger" class="tooltip-trigger-value">
                                <Timestamp date={positionInfo.closedAt} format="iso" withTime />
                            </p>
                            <span slot="tooltip-popup">
                                {positionInfoDescription.closedAt}
                            </span>
                        </Tooltip>
                    {/if}

                    <Tooltip>
                        <p slot="tooltip-trigger" class="tooltip-trigger-value">
                            <span>{formatDuration(positionInfo.durationSeconds)}</span>
                        </p>
                        <span slot="tooltip-popup">
                            {positionInfoDescription.durationSeconds}
                        </span>
                    </Tooltip>

                    {#if positionInfo.stillOpen}
                        <Badge text="Currently open" />
                    {/if}
			</DataBox>

            <DataBox label="Price">

                    <Tooltip>
                        <p slot="tooltip-trigger" class="tooltip-trigger-value">
                            <span>{formatPrice(positionInfo.openPrice)}</span>
                            —
                        </p>
                        <span slot="tooltip-popup">
                            {positionInfoDescription.openPrice}
                        </span>
                    </Tooltip>

                    {#if positionInfo.stillOpen}
                        <Tooltip>
                            <p slot="tooltip-trigger" class="tooltip-trigger-value">
                                <span>{formatPrice(positionInfo.currentPrice)}</span>
                            </p>
                            <span slot="tooltip-popup">
                                {positionInfoDescription.currentPrice}
                            </span>
                        </Tooltip>
                    {:else}
                        <Tooltip>
                            <p slot="tooltip-trigger" class="tooltip-trigger-value">
                                <span>{formatPrice(positionInfo.closePrice)}</span>
                            </p>
                            <span slot="tooltip-popup">
                                {positionInfoDescription.closePrice}
                            </span>
                        </Tooltip>
                    {/if}
			</DataBox>

            <DataBox label="Size">

                <Tooltip>
                    <p slot="tooltip-trigger" class="tooltip-trigger-value">
                        <span>{formatPrice(positionInfo.valueAtOpen)}</span>
                    </p>
                    <span slot="tooltip-popup">
                        {positionInfoDescription.valueAtOpen}
                    </span>
                </Tooltip>

                <Tooltip>
                    <p slot="tooltip-trigger" class="tooltip-trigger-value">
                        <span>
                            {formatTokenAmount(positionInfo.quantityAtOpen)}
                            {position.pair.base.token_symbol}
                        </span>
                    </p>
                    <span slot="tooltip-popup">
                        {positionInfoDescription.quantityAtOpen}
                    </span>
                </Tooltip>

			</DataBox>

            {#if positionInfo.stopLossable }
                <DataBox label="Stop loss">

                    <Tooltip>
                        <p slot="tooltip-trigger" class="tooltip-trigger-value">
                            <span>{formatPrice(positionInfo.stopLossPrice)}</span>
                        </p>
                        <span slot="tooltip-popup">
                            {positionInfoDescription.stopLossPrice}
                        </span>
                    </Tooltip>

                    <Tooltip>
                        <p slot="tooltip-trigger" class="tooltip-trigger-value">
                            <span>
                                {formatPercent(positionInfo.stopLossPercent)}
                            </span>
                        </p>
                        <span slot="tooltip-popup">
                            {positionInfoDescription.stopLossPercent}
                        </span>
                    </Tooltip>

                </DataBox>
            {/if}

		</DataBoxes>

		<TradeTable {trades} />
	</section>
</main>

<style lang="postcss">
	section {
		margin-top: var(--space-md);
		display: grid;
		gap: var(--space-5xl);

		@media (--viewport-sm-down) {
			gap: var(--space-xl);
		}
	}

	.profitability {
		display: flex;
		justify-content: space-between;
	}

	.error-details a {
		font-weight: 500;

		& .hash-wrapper {
			display: inline-grid;
		}
	}

    .tooltip-trigger-value {
        display: block;
    }

    /* Give user hint the value is clickable / hoverable
     *
     */
    .tooltip-trigger-value :global(*) {
        border-bottom: 1px dotted black;
    }

    .tooltip-trigger-value :global(.stop-loss) {
        display: inline-block;
        border-bottom: none;
    }


    .tooltip-trigger-value:after {
        content: '\A';
        white-space:pre;
    }
</style>
