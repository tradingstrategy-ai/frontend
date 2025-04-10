<!-- Trade executor status

- Left side nav

- Collapse to dropdown on mobile

-->
<script context="module" lang="ts">
	type MenuOption = {
		slug: string;
		label: string;
		positionStatus?: 'open' | 'closed' | 'frozen';
	};

	export const menuOptions: MenuOption[] = [
		{
			slug: '',
			label: 'Overview'
		},
		{
			slug: 'description',
			label: 'Description'
		},
		{
			slug: 'open-positions',
			label: 'Open positions',
			positionStatus: 'open'
		},
		{
			slug: 'closed-positions',
			label: 'Closed positions',
			positionStatus: 'closed'
		},
		{
			slug: 'frozen-positions',
			label: 'Frozen positions',
			positionStatus: 'frozen'
		},
		{
			slug: 'performance',
			label: 'Performance'
		},
		{
			slug: 'vault',
			label: 'Vault'
		},
		{
			slug: 'fees',
			label: 'Fees'
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
			slug: 'source',
			label: 'Source Code'
		},
		{
			slug: 'tech-details',
			label: 'Technical details'
		}
	];
</script>

<script lang="ts">
	import type { Portfolio } from 'trade-executor/schemas/portfolio';
	import type { PositionStatus } from 'trade-executor/schemas/position';
	import fsm from 'svelte-fsm';
	import { Button, Menu, MenuItem } from '$lib/components';
	import IconChevronDown from '~icons/local/chevron-down';

	export let basePath: string;
	export let currentPath: string;
	export let hasVault: boolean;
	export let backtestAvailable: boolean;
	export let portfolioPromise: Promise<Portfolio | undefined>;

	let menuWrapper: HTMLElement;
	let menuHeight = 'auto';

	let hasFrozenPositions = false;

	getPositionCount('frozen').then((count) => {
		hasFrozenPositions = Boolean(count);
	});

	$: currentSlug = currentPath.split('/')[3] ?? '';
	$: currentOption = menuOptions.find(({ slug }) => slug === currentSlug);

	$: visibleOptions = menuOptions.filter(({ slug }) => {
		// prettier-ignore
		switch (slug) {
			case currentOption?.slug : return true;
			case 'frozen-positions'  : return hasFrozenPositions;
			case 'vault'             : return hasVault;
			case 'fees'              : return hasVault;
			case 'backtest'          : return backtestAvailable;
			default                  : return true;
		}
	});

	function getTargetUrl(slug: string) {
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

<nav class="strategy-nav {$mobileMenu}" style:--menu-open-height={menuHeight}>
	<div class="mobile-toggle">
		<Button quarternary on:click={mobileMenu.toggle}>
			<IconChevronDown slot="icon" />
			{currentOption?.label ?? 'Show page'}
		</Button>
	</div>

	<div class="menu-wrapper" bind:this={menuWrapper}>
		<Menu on:click={mobileMenu.close}>
			{#each visibleOptions as { slug, label, positionStatus }}
				{@const active = slug === currentOption?.slug}
				<MenuItem targetUrl={getTargetUrl(slug)} {active}>
					<span class="label">{label}</span>
					{#if positionStatus}
						{#await getPositionCount(positionStatus)}
							<span class="count skeleton"></span>
						{:then count}
							<span class="count" class:active>{count ?? '-'}</span>
						{/await}
					{/if}
				</MenuItem>
			{/each}
		</Menu>
	</div>
</nav>

<style>
	.strategy-nav {
		--menu-gap: var(--space-sl);
		--menu-item-active-color: var(--c-text);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-border-radius: var(--radius-md);
		--menu-item-padding: 0 var(--space-md);

		@media (--viewport-md-down) {
			--menu-item-padding: 0 var(--space-ml);
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

			&.active {
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

		.mobile-toggle {
			display: grid;
			opacity: var(--mobile-toggle-opacity, 1);
			transition: opacity var(--time-md) ease-out;

			/* hide on desktop */
			@media (--viewport-lg-up) {
				display: none;
			}

			:global(.icon) {
				transition: transform var(--time-md) ease-out;
				transform: rotate(var(--icon-rotation, 0));
			}
		}

		.menu-wrapper {
			@media (--viewport-lg-up) {
				position: sticky;
				top: 2rem;
			}

			@media (--viewport-md-down) {
				overflow: hidden;
				height: var(--menu-height, 0);
				transition: height 0.25s ease-out;

				:global(menu) {
					padding-top: var(--space-ls);
				}
			}
		}

		/* mobile menu open styles */
		&.open {
			--menu-height: var(--menu-open-height);
			--mobile-toggle-opacity: 0.5;
			--icon-rotation: 180deg;
		}
	}
</style>
