<!-- Trade executor status

- Left side nav

- Collapse to dropdown on mobile

-->
<script lang="ts">
	import fsm from 'svelte-fsm';
	import { Button, Menu, MenuItem } from '$lib/components';
	import type { StrategySummaryStatistics } from 'trade-executor-frontend/strategy/runtimeState';

	export let strategyId: string;
	export let portfolio: any;
	export let currentPath: string;
	export let backtestAvailable: boolean;

	// We can find out from the summary if certain menu items
	// should be enabled or not
	export let summary: StrategySummaryStatistics;

	let menuWrapper: HTMLElement;
	let menuHeight = '';

	const basePath = `/strategies/${strategyId}`;

	let menuOptions = [
		{
			label: 'Overview',
			targetUrl: basePath
		},
		{
			label: `Open positions`,
			targetUrl: `${basePath}/open-positions`,
			count: getCount(portfolio.open_positions)
		},
		{
			label: `Closed positions`,
			targetUrl: `${basePath}/closed-positions`,
			count: getCount(portfolio.closed_positions)
		},
		{
			label: `Frozen positions`,
			targetUrl: `${basePath}/frozen-positions`,
			count: getCount(portfolio.frozen_positions)
		},
		{
			label: `Performance`,
			targetUrl: `${basePath}/performance`
		},

		{
			label: `TVL and netflow`,
			targetUrl: `${basePath}/netflow`
		}
	];

	if (backtestAvailable) {
		menuOptions.push({
			label: `Backtest results`,
			targetUrl: `${basePath}/backtest`
		});
	}

	menuOptions = menuOptions.concat([
		{
			label: `Decision making`,
			targetUrl: `${basePath}/decision-making`
		},
		{
			label: `Instance status`,
			targetUrl: `${basePath}/status`
		},
		{
			label: `Logs`,
			targetUrl: `${basePath}/logs`
		},
		{
			label: `Source Code`,
			targetUrl: `${basePath}/source`
		}
	]);

	$: currentOption = menuOptions.find(({ targetUrl }) => currentPath.endsWith(targetUrl));

	$: visibleOptions = menuOptions.filter((option) => {
		const isFrozenPositionsOption = option.targetUrl.includes('frozen-positions');
		const hasFrozenPositions = getCount(portfolio.frozen_positions) > 0;
		return !isFrozenPositionsOption || hasFrozenPositions || currentOption === option;
	});

	function getCount(positions: any = {}) {
		return Object.keys(positions).length;
	}

	const mobileMenu = fsm('closed', {
		closed: {
			toggle: 'open'
		},
		open: {
			toggle: 'closed',
			close: 'closed',
			_enter() {
				const clientHeight = menuWrapper.firstElementChild?.clientHeight;
				menuHeight = clientHeight ? `${clientHeight}px` : 'auto';
			}
		}
	});
</script>

<nav class="strategy-nav {$mobileMenu}" style:--menu-height={menuHeight}>
	<div class="mobile-toggle">
		<Button icon="chevron-down" quarternary on:click={mobileMenu.toggle}>
			{currentOption?.label || 'Show page'}
		</Button>
	</div>

	<div class="menu-wrapper" bind:this={menuWrapper}>
		<Menu on:click={mobileMenu.close}>
			{#each visibleOptions as option}
				<MenuItem targetUrl={option.targetUrl} active={option === currentOption} noScroll>
					<span class="label">{option.label}</span>
					{#if typeof option.count === 'number'}
						<span class="count">{option.count}</span>
					{/if}
				</MenuItem>
			{/each}
		</Menu>
	</div>
</nav>

<style lang="postcss">
	.strategy-nav {
		--menu-gap: var(--space-sl);
		--menu-item-active-color: var(--c-text-default);
		--menu-item-color: hsla(var(--hsl-text-extra-light));
		--menu-item-border-radius: var(--radius-md);
		--menu-item-padding: 0 var(--space-md);

		@media (--viewport-md-down) {
			--menu-item-padding: 0 var(--space-ml);
		}

		@media (--viewport-md-down) {
			--menu-item-font: var(--f-ui-md-medium);
			--menu-item-count-font: var(--f-ui-sm-bold);
		}
	}

	.label {
		padding-block: var(--space-ms);
		overflow: hidden;

		@media (--viewport-md-down) {
			padding-block: var(--space-sl);
		}
	}

	.count {
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--space-ll);
		min-width: var(--space-ll);
		margin-left: var(--space-sm);
		padding-inline: var(--space-ss);
		border-radius: var(--radius-lg);
		font: var(--f-ui-md-bold);
		letter-spacing: var(--f-ui-md-spacing, normal);
		color: var(--c-text-default);
		background: var(--c-background-3);

		@nest :global(a:not([href]):not([tabindex])) & {
			background: var(--c-background-1);
			color: var(--c-text-inverted);
		}

		@media (--viewport-md-down) {
			height: var(--space-lg);
			min-width: var(--space-lg);
			margin-left: var(--space-ss);
			padding-inline: var(--space-xs);
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}
	}

	.mobile-toggle :global {
		display: grid;

		@media (--viewport-lg-up) {
			display: none;
		}

		@nest .open & {
			opacity: 0.4;
		}

		& button svg {
			transition: transform 0.25s ease-out;

			@nest .open & {
				transform: rotate(180deg);
			}

			& path {
				stroke-width: 3px;
			}
		}
	}

	.menu-wrapper {
		@media (--viewport-lg-up) {
			position: sticky;
			top: 2rem;
		}

		@media (--viewport-md-down) {
			overflow: hidden;
			height: 0;
			transition: height 0.25s ease-out;

			@nest .open & {
				height: var(--menu-height);
			}

			& :global menu {
				padding-top: var(--space-ls);
			}
		}
	}
</style>
