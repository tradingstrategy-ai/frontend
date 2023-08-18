<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import Button from './ButtonNew.svelte';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import EntitySymbol from './EntitySymbol.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import Tooltip from './Tooltip.svelte';
	import isInViewport from '$lib/helpers/is-in-viewport';
	import { fromUnixTime } from 'date-fns';

	export let chartStartDate: Date | undefined = undefined;
	export let strategy: StrategyRuntimeState;

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const chartData = strategy?.summary_statistics?.performance_chart_90_days?.map(([ts, val]) => [
		fromUnixTime(ts),
		val
	]);

	let ctaButton: HTMLButtonElement;
	let innerWidth: number;

	$: isBacktested = strategy?.summary_statistics?.key_metrics
		? Object.values(strategy.summary_statistics.key_metrics).some((metric: any) => metric?.source === 'backtesting')
		: false;

	function blur() {
		if (!isInViewport(ctaButton)) return;
		ctaButton.blur();
	}

	function focus() {
		if (!isInViewport(ctaButton)) return;
		ctaButton.focus();
	}

	function getChainSlug(chain_id: number) {
		switch (chain_id) {
			case 1:
				return 'ethereum';
			case 137:
				return 'polygon';
		}
	}

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

<svelte:window bind:innerWidth />

<a
	class="strategy-tile"
	href={`/strategies/${strategy.link.replace('/strategy/', '')}`}
	on:focus={focus}
	on:mouseover={focus}
	on:blur={blur}
	on:mouseleave={blur}
>
	<div class="visuals">
		<div class="top">
			<div class="tokens">
				{#each getStrategyTokens(strategy) as slug}
					{@const symbol = slug.toUpperCase()}
					<Tooltip>
						<svelte:fragment slot="trigger">
							<EntitySymbol type="token" size="2.5rem" {slug} />
						</svelte:fragment>

						<span slot="popup">This strategy trades <strong>{symbol}</strong></span>
					</Tooltip>
				{/each}
			</div>
		</div>
		<div class="chart">
			<ChartThumbnail data={chartData} startDate={chartStartDate} />
		</div>
	</div>
	<div class="content">
		<header>
			<div class="avatar">
				<img src={strategy.icon_url} alt={strategy.name} />
				<div class="chain-icon">
					<Tooltip>
						<svelte:fragment slot="trigger">
							<EntitySymbol slug={getChainSlug(strategy?.on_chain_data?.chain_id)} type="blockchain" />
						</svelte:fragment>
						<span slot="popup">
							This strategy runs on <strong>{getChainSlug(strategy?.on_chain_data?.chain_id)}</strong> blockchain
						</span>
					</Tooltip>
				</div>
			</div>
			<div class="description">
				<h3>{strategy.name}</h3>
				<p>{strategy.short_description}</p>
			</div>
		</header>
		<div class="data">
			<StrategyDataSummary {backtestLink} {strategy} />

			{#if isBacktested}
				<span class="backtest-data-badge">Backtested Metrics*</span>
			{/if}
		</div>
		<div class="actions">
			<Button size="lg" bind:thisButton={ctaButton}>View strategy</Button>
		</div>
	</div>
</a>

<style lang="postcss">
	@import './css/radius-new.css';

	.strategy-tile {
		background: hsla(var(--hsla-box-1));
		border: 1px hsla(var(--hsla-box-3)) solid;
		border-radius: var(--radius-lg);
		color: hsla(var(--hsl-text));
		text-decoration: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(90vw, 24rem), 1fr));
		transition: var(--transition-1);

		&:hover {
			background: hsla(var(--hsla-box-2));
			z-index: 9999999;
		}

		& .visuals {
			padding-top: 2rem;
			display: grid;
			position: relative;

			& .top {
				align-items: flex-start;
				display: flex;
				gap: 1rem;
				justify-content: space-between;
				padding: 1rem;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;

				& .tokens {
					display: flex;
					gap: 0.5rem;

					& :global(.entity-symbol) {
						border-radius: 100%;
						box-shadow: var(--shadow-1);
					}
				}
			}

			& .chart {
				z-index: -1;
				& svg {
					width: 100%;
					height: 100%;
				}
			}
		}

		& .content {
			container-type: inline-size;
			display: grid;
			gap: 0.75rem;
			padding: 1.5rem;
			@media (--viewport-sm-down) {
				padding: 1rem;
			}

			& header {
				--avatar-size: 6rem;
				@media (--viewport-sm-down) {
					--avatar-size: 4.75rem;
				}
				align-items: center;
				display: grid;
				grid-template-columns: 6rem auto;
				gap: 1.5rem;

				& .avatar {
					background: hsla(var(--hsla-box-3));
					border-radius: 100%;
					font: var(--f-ui-sm-roman);
					text-align: center;
					display: grid;
					height: var(--avatar-size);
					position: relative;
					width: var(--avatar-size);

					& :global(.tooltip .popup) {
						min-width: 20rem;
					}

					& img {
						border-radius: 100%;
						height: 100%;
						object-fit: cover;
						overflow: hidden;
						width: 100%;
						display: grid;
						place-items: center;
					}

					& .chain-icon {
						border-radius: 100%;
						bottom: -0.5rem;
						box-shadow: var(--shadow-1);
						background: hsla(var(--hsl-white));
						display: flex;
						padding: 0.25rem;
						position: absolute;
						right: -0.5rem;

						& strong {
							text-transform: capitalize;
						}
					}
				}

				& .description {
					align-items: center;
					justify-items: start;
					display: grid;
					gap: 0.25rem;

					& :where(h3, p) {
						margin: 0;
					}
				}

				& h3 {
					font: var(--f-ui-xxl-medium);

					@container (width <= 420px) {
						font: var(--f-ui-xl-medium);
					}

					@container (width <= 332px) {
						font: var(--f-ui-lg-medium);
					}
				}

				& p {
					font: var(--f-ui-md-medium);
					color: hsla(var(--hsl-text-extra-light));
				}
			}

			& .data {
				position: relative;
			}

			& .backtest-data-badge {
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

			& .actions {
				display: grid;
			}
		}

		& :global(.strategy-data-summary) {
			margin-block: 1.25rem;
			@media (--viewport-sm-down) {
				margin-block: 0.75rem;
			}
		}
	}
</style>
