<!--
@component
Left-side navigation for YAML-configured strategy pages.

Sidebar on desktop, collapsible dropdown on mobile — same pattern as StrategyNav
but with a static set of menu items (no conditional visibility or badges).
-->
<script context="module" lang="ts">
	export const menuOptions = [
		{ slug: '', label: 'Overview' },
		{ slug: 'performance', label: 'Performance' },
		{ slug: 'description', label: 'Description' },
		{ slug: 'vault', label: 'Vault info' },
		{ slug: 'fees', label: 'Fees' }
	];
</script>

<script lang="ts">
	import fsm from 'svelte-fsm';
	import { Button, Menu, MenuItem } from '$lib/components';
	import IconChevronDown from '~icons/local/chevron-down';

	export let basePath: string;
	export let currentPath: string;

	let menuWrapper: HTMLElement;
	let menuHeight = 'auto';

	$: currentSlug = currentPath.split('/')[3] ?? '';
	$: currentOption = menuOptions.find(({ slug }) => slug === currentSlug);

	function getTargetUrl(slug: string) {
		return slug ? `${basePath}/${slug}` : basePath;
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
			{#each menuOptions as { slug, label }}
				{@const active = slug === currentOption?.slug}
				<MenuItem targetUrl={getTargetUrl(slug)} {active}>
					<span class="label">{label}</span>
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

		.mobile-toggle {
			display: grid;
			opacity: var(--mobile-toggle-opacity, 1);
			transition: opacity var(--time-md) ease-out;

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

		&.open {
			--menu-height: var(--menu-open-height);
			--mobile-toggle-opacity: 0.5;
			--icon-rotation: 180deg;
		}
	}
</style>
