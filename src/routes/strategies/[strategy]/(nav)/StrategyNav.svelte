<script lang="ts">
	import fsm from 'svelte-fsm';
	import { Button, Menu, MenuItem } from '$lib/components';

	export let strategyId: string;
	export let portfolio: any;
	export let currentPath: string;

	let menuWrapper: HTMLElement;
	let menuHeight = '';

	const basePath = `/strategies/${strategyId}`;

	const menuOptions = [
		{ label: 'Overview', targetUrl: basePath },
		{ label: `Open positions`, targetUrl: `${basePath}/open-positions` },
		{ label: `Closed positions`, targetUrl: `${basePath}/closed-positions` },
		{ label: `Frozen positions`, targetUrl: `${basePath}/frozen-positions` },
		{ label: `Performance`, targetUrl: `${basePath}/performance` },
		{ label: `Decision making`, targetUrl: `${basePath}/decision-making` },
		{ label: `Instance status`, targetUrl: `${basePath}/status` },
		{ label: `Logs`, targetUrl: `${basePath}/logs` },
		{ label: `Source Code`, targetUrl: `${basePath}/source` }
	];

	$: currentOption = menuOptions.find(({ targetUrl }) => currentPath.endsWith(targetUrl));

	$: visibleOptions = menuOptions.filter((option) => {
		const isFrozenPositionsOption = option.targetUrl.includes('frozen-positions');
		const hasFrozenPositions = Object.values(portfolio.frozen_positions).length > 0;
		return !isFrozenPositionsOption || hasFrozenPositions || currentOption === option;
	});

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
				<MenuItem {...option} active={option === currentOption} noScroll />
			{/each}
		</Menu>
	</div>
</nav>

<style lang="postcss">
	.strategy-nav {
		--menu-gap: var(--space-sl);
		--menu-item-active-color: var(--c-text-default);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-border-radius: var(--radius-md);
		--menu-item-padding: var(--space-ms) var(--space-md);

		@media (--viewport-lg-down) {
			--menu-item-padding: var(--space-sl) var(--space-ml);
		}

		@media (--viewport-md-down) {
			--menu-item-font: var(--f-ui-md-medium);
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
