<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { utcDay } from 'd3-time';
	import { normalizeDataForInterval } from '$lib/chart';
	import { getChain } from '$lib/helpers/chain.js';
	import { Button, DataBadge, Tooltip } from '$lib/components';
	import { StrategyIcon, StrategyError, shouldDisplayError, adminOnlyError } from 'trade-executor/components';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import Alert from '$lib/components/Alert.svelte';

	export let admin = false;
	export let simplified = false;
	export let strategy: StrategyRuntimeState;
	export let chartDateRange: [Date?, Date?];

	const chain = getChain(strategy.on_chain_data?.chain_id);

	const tags = strategy.tags?.filter((tag) => tag !== 'live') ?? [];
	const isLive = strategy.tags?.includes('live');

	const launchedAt = strategy.summary_statistics?.launched_at;
	const isNew = launchedAt ? utcDay.count(launchedAt, new Date()) < 90 : false;

	const href = `/strategies/${strategy.id}`;

	const chartData = normalizeDataForInterval(
		strategy.summary_statistics?.compounding_unrealised_trading_profitability ?? [],
		utcDay
	);

	const handleClick: EventHandler = ({ target }) => {
		// skip explicit goto if user clicked an anchor tag
		if (target instanceof HTMLAnchorElement && target.href) return;
		goto(href);
	};
</script>

<!-- tile container element MUST NOT be an anchor tag; see StrategyTile.test.ts  -->
<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<div class="strategy-tile ds-3" on:click={handleClick}>
	<div class="visuals" class:simplified>
		<div class="top">
			<div>
				{#if chain}
					<Tooltip>
						<img class="chain-icon" slot="trigger" src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
						<span slot="popup">
							This strategy runs on <strong>{chain.name}</strong> blockchain
						</span>
					</Tooltip>
				{/if}
			</div>

			<div class="badges">
				{#if !simplified && shouldDisplayError(strategy, admin)}
					<Tooltip>
						<DataBadge slot="trigger" status="error">Error</DataBadge>
						<svelte:fragment slot="popup">
							{#if adminOnlyError(strategy)}
								<p>
									<Alert size="xs" status="info" title="Note">This error is only displayed to admin users.</Alert>
								</p>
							{/if}
							<StrategyError {strategy} />
						</svelte:fragment>
					</Tooltip>
				{/if}

				{#if !simplified && admin && isLive}
					<DataBadge status="success">live</DataBadge>
				{/if}

				{#if isNew && !strategy.new_version_id}
					<DataBadge status="success">new</DataBadge>
				{/if}

				{#if !simplified}
					{#each tags as tag}
						<DataBadge status="warning">{tag}</DataBadge>
					{/each}
				{/if}

				{#if !simplified && strategy.new_version_id}
					<Tooltip>
						<DataBadge slot="trigger" status="error">Outdated</DataBadge>
						<svelte:fragment slot="popup">
							This is an outdated strategy. An updated version is available
							<a href="/strategies/{strategy.new_version_id}">here</a>.
						</svelte:fragment>
					</Tooltip>
				{/if}
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
			</div>
			<div class="description">
				<h3 class="truncate">{strategy.name}</h3>
				<p class="truncate lines-3">{strategy.short_description ?? '---'}</p>
			</div>
		</header>
		<div class="data">
			<StrategyDataSummary {simplified} {strategy} />
		</div>
		<div class="actions">
			<Button size="md" {href}>View strategy</Button>
		</div>
	</div>
</div>

<style>
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
			}

			.chain-icon {
				display: flex;
				border-radius: 100%;
				height: 1.875rem;
				aspect-ratio: 1;
				padding: 15%;
				border: 1px solid var(--c-box-4);
				background: var(--c-box-2);
			}

			.badges {
				display: flex;
				gap: 0.375rem;
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

			.chart {
				z-index: -1;
			}

			&.simplified .chart {
				margin-block: -2rem;

				:global(figcaption) {
					bottom: 1rem;
				}
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
