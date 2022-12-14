<script lang="ts">
	import fsm from 'svelte-fsm';
	import { Button, Menu, MenuItem } from '$lib/components';

	export let strategyId: string;
	export let currentPath: string;

	let menuWrapper: HTMLElement;
	let menuHeight = '';

	const menuOptions = [
		{ label: 'Overview', targetUrl: `/strategies/${strategyId}`, noScroll: true },
		{ label: 'Open positions', targetUrl: `/strategies/${strategyId}/open-positions`, noScroll: true },
		{ label: 'Closed positions', targetUrl: `/strategy/${strategyId}/closed-positions` },
		{ label: 'Performance', targetUrl: `/strategies/${strategyId}/performance`, noScroll: true },
		{ label: 'Decision making', targetUrl: `/strategies/${strategyId}/decision-making`, noScroll: true },
		{ label: 'Instance status', targetUrl: `/strategies/${strategyId}/status`, noScroll: true },
		{ label: 'Logs', targetUrl: `/strategies/${strategyId}/logs`, noScroll: true },
		{ label: 'Source Code', targetUrl: `/strategies/${strategyId}/source`, noScroll: true }
	];

	$: currentOption = menuOptions.find((option) => currentPath.endsWith(option.targetUrl));

	const mobileMenu = fsm('closed', {
		closed: { toggle: 'open' },
		open: { toggle: 'closed', close: 'closed', _enter: setMenuHeight }
	});

	function setMenuHeight() {
		const clientHeight = menuWrapper.firstElementChild?.clientHeight;
		menuHeight = clientHeight ? `${clientHeight}px` : 'auto';
	}
</script>

<nav class="strategy-nav {$mobileMenu}" style:--menu-height={menuHeight}>
	<div class="mobile-toggle">
		<Button icon="chevron-down" quarternary on:click={mobileMenu.toggle}>
			{currentOption?.label || 'Show page'}
		</Button>
	</div>

	<div class="menu-wrapper" bind:this={menuWrapper}>
		<Menu on:click={mobileMenu.close}>
			{#each menuOptions as option}
				<MenuItem {...option} active={option === currentOption} />
			{/each}
		</Menu>
	</div>
</nav>

<style lang="postcss">
	.strategy-nav {
		--menu-gap: 0.75rem;
		--menu-item-active-color: var(--c-text-default);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-border-radius: var(--border-radius-md);
		--menu-item-padding: 0.875rem 1rem;

		@media (--viewport-lg-down) {
			--menu-item-padding: 0.75rem 1.125rem;
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
		@media (--viewport-md-down) {
			overflow: hidden;
			height: 0;
			transition: height 0.25s ease-out;

			@nest .open & {
				height: var(--menu-height);
			}

			& :global menu {
				padding-top: 1.25rem;
			}
		}
	}
</style>
