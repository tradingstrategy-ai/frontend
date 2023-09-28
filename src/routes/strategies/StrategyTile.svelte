<script lang="ts">
	import type { ApiChain } from '$lib/helpers/chain.js';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { Alert, Button, EntitySymbol, Tooltip } from '$lib/components';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import { fromUnixTime } from 'date-fns';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let strategy: StrategyRuntimeState;
	export let chain: ApiChain;

	const href = `/strategies/${strategy.id}`;
	const summaryStatistics = strategy.summary_statistics ?? {};
	const chartData = summaryStatistics.performance_chart_90_days?.map(([ts, val]) => [fromUnixTime(ts), val]);
	const errorHtml = getTradeExecutorErrorHtml(strategy);
	const keyMetrics = summaryStatistics.key_metrics ?? {};
	const isBacktested = Object.values(keyMetrics).some(({ source }) => source === 'backtesting');

	// FIXME: hack to infer list of tokens based on strategy ID;
	// In the future this will come from the strategy configuration.
	function getStrategyTokens({ id }: StrategyRuntimeState) {
		if (id.includes('multipair')) {
			return ['usdc'];
		} else if (id.includes('matic')) {
			return ['matic', 'usdc'];
		} else {
			return ['eth', 'usdc'];
		}
	}
</script>

<!-- tile container element MUST NOT be an anchor tag; see StrategyTile.test.ts  -->
<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<div class="strategy-tile ds-3" on:click={() => goto(href)}>
	<div class="visuals">
		<div class="top">
			<div class="tokens">
				{#each getStrategyTokens(strategy) as slug}
					{@const symbol = slug.toUpperCase()}
					<Tooltip>
						<EntitySymbol slot="trigger" type="token" size="var(--token-size)" {slug} />
						<span slot="popup">This strategy trades <strong>{symbol}</strong></span>
					</Tooltip>
				{/each}
			</div>

			{#if errorHtml}
				<div class="errors">
					<Tooltip>
						<Alert slot="trigger" size="xs">Error occurred</Alert>
						<svelte:fragment slot="popup">{@html errorHtml}</svelte:fragment>
					</Tooltip>
				</div>
			{/if}
		</div>
		<div class="chart">
			<ChartThumbnail data={chartData} />
		</div>
	</div>
	<div class="content">
		<header>
			<div class="avatar">
				<img src={strategy.icon_url} alt={strategy.name} />
				{#if chain}
					<div class="chain-icon">
						<Tooltip>
							<EntitySymbol slot="trigger" slug={chain.chain_slug} type="blockchain" />
							<span slot="popup">
								This strategy runs on <strong>{chain.chain_slug}</strong> blockchain
							</span>
						</Tooltip>
					</div>
				{/if}
			</div>
			<div class="description">
				<h3>{strategy.name}</h3>
				<p>{strategy.short_description ?? '---'}</p>
			</div>
		</header>
		<div class="data">
			<StrategyDataSummary {strategy} />

			{#if isBacktested}
				<span class="backtest-data-badge">* Backtested Metrics</span>
			{/if}
		</div>
		<div class="actions" on:click|stopPropagation>
			<Button size="md" {href}>View strategy</Button>
		</div>
	</div>
</div>

<style lang="postcss">
	.strategy-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(90vw, 28rem), 1fr));
		background: hsla(var(--hsla-box-1));
		border: 1px hsla(var(--hsla-box-3)) solid;
		border-radius: var(--radius-lg);
		color: hsla(var(--hsl-text));
		cursor: pointer;
		transition: var(--transition-1);

		&:hover {
			background: hsla(var(--hsla-box-2));
			z-index: 2;
		}

		.errors {
			position: relative;
			z-index: 1;

			:global(.tooltip .popup) {
				position: absolute;
				width: 22rem;
				right: 0;
				left: auto;
				bottom: auto;
			}

			:global(.alert-item) {
				container-type: unset;
			}
		}

		.visuals {
			padding-top: 2rem;
			display: grid;
			position: relative;
			@media (--viewport-md-up) {
				padding-top: 4rem;
			}

			.top {
				align-items: flex-start;
				display: flex;
				gap: 1rem;
				justify-content: space-between;
				padding: 1rem;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;

				.tokens {
					display: flex;
					gap: 0.5rem;
					--token-size: 2.5rem;
					@media (--viewport-sm-down) {
						--token-size: 2rem;
					}

					:global(.entity-symbol) {
						border-radius: 100%;
						box-shadow: var(--shadow-1);
					}
				}
			}

			&:not(:hover) .chart {
				z-index: -1;
			}
		}

		.content {
			container-type: inline-size;
			display: grid;
			gap: 0.75rem;
			padding: 1.5rem;
			@media (--viewport-sm-down) {
				padding: 1rem;
			}

			header {
				--avatar-size: 6rem;
				align-items: center;
				display: grid;
				grid-template-columns: 6rem auto;
				gap: 1.5rem;
				@media (--viewport-sm-down) {
					--avatar-size: 4.75rem;
					gap: 0.5rem;
				}

				.avatar {
					background: hsla(var(--hsla-box-3));
					border-radius: 100%;
					font: var(--f-ui-sm-roman);
					text-align: center;
					display: grid;
					height: var(--avatar-size);
					position: relative;
					width: var(--avatar-size);

					:global(.tooltip .popup) {
						min-width: 20rem;
					}

					img {
						border-radius: 100%;
						height: 100%;
						object-fit: cover;
						overflow: hidden;
						width: 100%;
						display: grid;
						place-items: center;
					}

					.chain-icon {
						border-radius: 100%;
						bottom: -0.5rem;
						box-shadow: var(--shadow-1);
						background: hsla(var(--hsl-white));
						display: flex;
						padding: 0.25rem;
						position: absolute;
						right: -0.5rem;

						strong {
							text-transform: capitalize;
						}
					}
				}

				.description {
					align-items: center;
					justify-items: start;
					display: grid;
					gap: 0.25rem;

					:where(h3, p) {
						margin: 0;
					}
				}

				h3 {
					font: var(--f-ui-xxl-medium);

					@container (width <= 520px) {
						font: var(--f-ui-xl-medium);
					}

					@container (width <= 400px) {
						font: var(--f-ui-lg-medium);
					}
				}

				p {
					font: var(--f-ui-md-medium);
					color: hsla(var(--hsl-text-extra-light));
				}
			}

			.data {
				position: relative;
			}

			.backtest-data-badge {
				align-items: center;
				border-radius: var(--radius-sl);
				color: hsla(var(--hsl-text-extra-light));
				display: inline-flex;
				font: var(--f-ui-xs-bold);
				gap: 0.625rem;
				justify-content: center;
				margin-block: 0.25rem 0.75rem;
				text-transform: uppercase;
			}

			.actions {
				display: grid;
			}
		}

		&:is(:hover, :focus) .actions :global(.button) {
			background: hsla(var(--hsl-text), 1);
			color: hsla(var(--hsl-text-inverted));
		}
	}
</style>
