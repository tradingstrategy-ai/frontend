<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import type { ApiChain } from '$lib/helpers/chain.js';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { type RawTick, type Quote, rawTicksToQuotes } from '$lib/chart';
	import { goto } from '$app/navigation';
	import { Button, DataBadge, EntitySymbol, Tooltip } from '$lib/components';
	import StrategyBadges from './StrategyBadges.svelte';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let admin = false;
	export let strategy: StrategyRuntimeState;
	export let chain: ApiChain | undefined;

	const href = `/strategies/${strategy.id}`;
	const errorHtml = getTradeExecutorErrorHtml(strategy);

	let chartData: Quote[] = [];
	let isBacktested = false;

	if (strategy.connected) {
		const stats = strategy.summary_statistics;
		chartData = rawTicksToQuotes((stats.performance_chart_90_days ?? []) as RawTick[]);
		isBacktested = Object.values(stats.key_metrics).some(({ source }) => source === 'backtesting');
	}

	const handleClick: EventHandler = ({ target }) => {
		// skip explicit goto if user clicked an anchor tag
		if (target instanceof HTMLAnchorElement && target.href) return;
		goto(href);
	};

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
<div class="strategy-tile ds-3" on:click={handleClick}>
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

			<div class="badges">
				{#if errorHtml}
					<Tooltip>
						<DataBadge slot="trigger" status="error">Error</DataBadge>
						<svelte:fragment slot="popup">{@html errorHtml}</svelte:fragment>
					</Tooltip>
				{/if}
				<StrategyBadges tags={strategy.tags} includeLive={admin} />
			</div>
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
				<div class="backtest-indicator">* Backtested Metrics</div>
			{/if}
		</div>
		<div class="actions">
			<Button size="md" {href}>View strategy</Button>
		</div>
	</div>
</div>

<style lang="postcss">
	.strategy-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(90vw, 24rem), 1fr));
		background: hsl(var(--hsla-box-1));
		border: 1px hsl(var(--hsla-box-3)) solid;
		border-radius: var(--radius-lg);
		color: hsl(var(--hsl-text));
		cursor: pointer;
		transition: var(--transition-1);

		&:hover {
			background: hsl(var(--hsla-box-2));
			z-index: 2;
		}

		.visuals {
			padding-top: 2rem;
			display: grid;
			position: relative;
			@media (--viewport-md-up) {
				padding-top: 4rem;
			}

			.top {
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
					--token-size: 2rem;

					:global(.entity-symbol) {
						border-radius: 100%;
						box-shadow: var(--shadow-1);
					}
				}

				.badges {
					display: flex;
					gap: 0.5em;
					font: var(--f-ui-sm-medium);

					:global([data-css-props]) {
						--data-badge-height: 100%;
					}

					:global(.tooltip .popup) {
						position: absolute;
						max-width: 22rem;
						right: 0;
						left: auto;
						bottom: auto;
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
					background: hsl(var(--hsla-box-3));
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
						background: hsl(var(--hsl-text-inverted));
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
					color: hsl(var(--hsl-text-extra-light));
				}
			}

			.data {
				position: relative;
			}

			.backtest-indicator {
				font: var(--f-ui-xs-bold);
				letter-spacing: 0.03em;
				color: hsl(var(--hsl-text-extra-light));
				text-transform: uppercase;
			}

			.actions {
				display: grid;
			}
		}

		&:is(:hover, :focus) {
			.actions :global(.button) {
				background: hsl(var(--hsl-text));
				color: hsl(var(--hsl-text-inverted));
			}

			.chart :global(figcaption) {
				opacity: 1;
			}
		}
	}
</style>
