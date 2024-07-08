<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { utcDay } from 'd3-time';
	import { normalizeDataForInterval } from '$lib/chart';
	import { getChain } from '$lib/helpers/chain.js';
	import { Button, DataBadge, EntitySymbol, Tooltip } from '$lib/components';
	import { StrategyIcon } from 'trade-executor/components';
	import StrategyBadges from './StrategyBadges.svelte';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let admin = false;
	export let strategy: StrategyRuntimeState;
	export let chartDateRange: [Date?, Date?];

	const chain = getChain(strategy.on_chain_data?.chain_id);

	const href = `/strategies/${strategy.id}`;
	const errorHtml = getTradeExecutorErrorHtml(strategy);

	const chartData = normalizeDataForInterval(
		strategy.summary_statistics?.compounding_unrealised_trading_profitability ?? [],
		utcDay
	);

	const handleClick: EventHandler = ({ target }) => {
		// skip explicit goto if user clicked an anchor tag
		if (target instanceof HTMLAnchorElement && target.href) return;
		goto(href);
	};

	// FIXME: hack to infer list of tokens based on strategy ID;
	// In the future this will come from the strategy configuration.
	function getStrategyTokens({ id }: StrategyRuntimeState) {
		const tokens: string[] = [];
		for (const token of ['eth', 'btc', 'matic']) {
			if (id.includes(token)) tokens.push(token);
		}
		return [...tokens, 'usdc'];
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
						<EntitySymbol slot="trigger" size="2rem" logoUrl={getLogoUrl('token', slug)} />
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
				<StrategyBadges tags={strategy.tags ?? []} includeLive={admin} />
			</div>
		</div>
		<div class="chart">
			<ChartThumbnail data={chartData} dateRange={chartDateRange} />
		</div>
	</div>
	<div class="content">
		<header>
			<div class="avatar">
				<StrategyIcon {strategy} />
				{#if chain}
					<div class="chain-icon">
						<Tooltip>
							<EntitySymbol
								slot="trigger"
								size="var(--chain-icon-size)"
								logoUrl={getLogoUrl('blockchain', chain.slug)}
							/>
							<span slot="popup">
								This strategy runs on <strong>{chain.name}</strong> blockchain
							</span>
						</Tooltip>
					</div>
				{/if}
			</div>
			<div class="description">
				<h3 class="truncate">{strategy.name}</h3>
				<p class="truncate lines-3">{strategy.short_description ?? '---'}</p>
			</div>
		</header>
		<div class="data">
			<StrategyDataSummary {strategy} />
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
		grid-template-rows: auto 1fr;
		background: var(--c-box-1);
		border: 1px var(--c-box-3) solid;
		border-radius: var(--radius-lg);
		color: var(--c-text);
		cursor: pointer;
		transition: var(--transition-1);

		&:hover {
			background: var(--c-box-2);
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
			grid-template-rows: auto 1fr auto;
			gap: 0.75rem;
			padding: 1.5rem;

			@media (--viewport-sm-down) {
				padding: 1rem;
			}

			header {
				--avatar-size: 6rem;
				--chain-icon-size: 1.5rem;
				display: grid;
				grid-template-columns: var(--avatar-size) auto;
				align-items: center;
				gap: 1.5rem;

				@container (width <= 400px) {
					--avatar-size: 4.75rem;
					--chain-icon-size: 1.25rem;
					gap: 1.25rem;
				}

				.avatar {
					position: relative;
					display: grid;
					height: var(--avatar-size);
					width: var(--avatar-size);
					border-radius: 100%;
					background: var(--c-box-3);
					font: var(--f-ui-sm-roman);
					text-align: center;

					:global(.tooltip .popup) {
						min-width: 20rem;
					}

					.chain-icon {
						display: flex;
						position: absolute;
						right: 0;
						bottom: 0;
						padding: 5%;
						transform: translate(20%, 20%);
						border-radius: 100%;
						box-shadow: var(--shadow-1);
						background: var(--c-text-inverted);

						strong {
							text-transform: capitalize;
						}
					}
				}

				.description {
					display: grid;
					gap: 0.25rem;

					:where(h3, p) {
						margin: 0;
					}
				}

				h3 {
					font: var(--f-ui-xxl-medium);
					letter-spacing: var(--ls-ui-xxl, normal);
					white-space: nowrap;

					@container (width <= 520px) {
						font: var(--f-ui-xl-medium);
						letter-spacing: var(--ls-ui-xl, normal);
					}

					@container (width <= 400px) {
						font: var(--f-ui-lg-medium);
						letter-spacing: var(--ls-ui-lg, normal);
					}
				}

				p {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md, normal);
					color: var(--c-text-extra-light);

					@container (width <= 400px) {
						font: var(--f-ui-sm-medium);
						letter-spacing: var(--ls-ui-sm, normal);
					}
				}
			}

			.data {
				position: relative;
			}

			.actions {
				display: grid;
			}
		}

		&:is(:hover, :focus) {
			.actions :global(.button) {
				background: var(--c-text);
				color: var(--c-text-inverted);
			}

			.chart :global(figcaption) {
				opacity: 1;
			}
		}
	}
</style>
