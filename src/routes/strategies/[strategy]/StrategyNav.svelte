<!-- Trade executor status

- Left side nav

- Collapse to dropdown on mobile

-->
<script lang="ts">
	import type { Portfolio } from 'trade-executor/state/portfolio';
	import type { PositionStatus } from 'trade-executor/state/position';
	import fsm from 'svelte-fsm';
	import { Button, Menu, MenuItem } from '$lib/components';

	export let basePath: string;
	export let currentPath: string;
	export let hasEnzymeVault: boolean;
	export let backtestAvailable: boolean;
	export let portfolioPromise: Promise<Portfolio | undefined>;

	let menuWrapper: HTMLElement;
	let menuHeight = 'auto';

	let hasFrozenPositions = false;

	getPositionCount('frozen').then((count) => {
		hasFrozenPositions = Boolean(count);
	});

	type MenuOption = {
		slug: string;
		label: string;
		count?: Promise<number | undefined>;
	};

	const menuOptions: MenuOption[] = [
		{
			slug: '',
			label: 'Overview'
		},
		{
			slug: 'open-positions',
			label: 'Open positions',
			count: getPositionCount('open')
		},
		{
			slug: 'closed-positions',
			label: 'Closed positions',
			count: getPositionCount('closed')
		},
		{
			slug: 'frozen-positions',
			label: 'Frozen positions',
			count: getPositionCount('frozen')
		},
		{
			slug: 'performance',
			label: 'Performance'
		},
		{
			slug: 'vault',
			label: 'Enzyme vault'
		},
		{
			slug: 'netflow',
			label: 'TVL and netflow'
		},
		{
			slug: 'backtest',
			label: 'Backtest results'
		},
		{
			slug: 'decision-making',
			label: 'Decision making'
		},
		{
			slug: 'status',
			label: 'Instance status'
		},
		{
			slug: 'logs',
			label: 'Logs'
		},
		{
			slug: 'source',
			label: 'Source Code'
		}
	];

	$: currentOption = menuOptions.find((option) => currentPath.endsWith(getTargetUrl(option)));

	$: visibleOptions = menuOptions.filter((option) => {
		// always show current menu option
		if (option === currentOption) return true;

		// conditional menu options
		// prettier-ignore
		switch (option.slug) {
			case 'frozen-positions' : return hasFrozenPositions;
			case 'vault'            : return hasEnzymeVault;
			case 'backtest'         : return backtestAvailable;
		}

		// show all other options
		return true;
	});

	function getTargetUrl({ slug }: MenuOption) {
		return slug ? `${basePath}/${slug}` : basePath;
	}

	async function getPositionCount(status: PositionStatus) {
		const portfolio = await portfolioPromise;
		const positions = portfolio?.[`${status}_positions`];
		return positions && Object.keys(positions).length;
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
				<MenuItem targetUrl={getTargetUrl(option)} active={option === currentOption}>
					<span class="label">{option.label}</span>
					{#if 'count' in option}
						{#await option.count}
							<span class="count skeleton" />
						{:then count}
							<span class="count">{count ?? '-'}</span>
						{/await}
					{/if}
				</MenuItem>
			{/each}
		</Menu>
	</div>
</nav>

<style lang="postcss">
	.strategy-nav {
		--menu-gap: var(--space-sl);
		--menu-item-active-color: var(--c-text);
		--menu-item-color: var(--c-text-extra-light);
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
		--skeleton-radius: var(--radius-lg);
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
		color: var(--c-text);
		background: var(--c-box-3);

		:global(a:not([href]):not([tabindex])) & {
			background: var(--c-text);
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

		.open & {
			opacity: 0.4;
		}

		button svg {
			transition: transform 0.25s ease-out;

			.open & {
				transform: rotate(180deg);
			}

			path {
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

			.open & {
				height: var(--menu-height);
			}

			:global menu {
				padding-top: var(--space-ls);
			}
		}
	}
</style>
