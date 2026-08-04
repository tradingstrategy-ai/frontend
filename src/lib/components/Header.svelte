<!--
@component
Responsive site header with menu, search and compact-navigation controls.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import NavPanel from '$lib/components/NavPanel.svelte';
	import IconMenu from '~icons/local/menu';

	interface Props {
		menu?: Snippet;
		search?: Snippet<[menu: boolean, onNavigate: () => void]>;
	}

	let { menu, search }: Props = $props();
	let panelOpen = $state(false);
	const noop = () => {};
</script>

<div class="header-bar">
	<div class="logo">
		<a href="/" aria-label="Home">
			<Logo />
		</a>
	</div>

	<nav class="desktop-only">
		<Menu horizontal align="center">
			{@render menu?.()}
		</Menu>
	</nav>

	<div class="search">
		{@render search?.(false, noop)}
	</div>

	<button
		class="show-nav-panel mobile-only"
		aria-label="Show navigation panel"
		aria-expanded={panelOpen}
		onclick={() => (panelOpen = true)}
	>
		<IconMenu />
	</button>
</div>

<div class="nav-panel mobile-only">
	<NavPanel bind:open={panelOpen}>
		{#snippet panelSearch()}
			{@render search?.(true, () => (panelOpen = false))}
		{/snippet}
		{@render menu?.()}
	</NavPanel>
</div>

<style>
	:global(:root) {
		--header-height: 4.75rem;

		@media (--viewport-xxl) {
			--header-height: 5.25rem;
		}

		@media (--nav-collapsed) {
			--header-height: 3.75rem;
		}
	}

	.header-bar {
		display: grid;
		grid-template-columns:
			/* lg logo = 12.5rem = 10.5rem (sm logo) + 1.25rem (gap) + 0.75rem (delta) */
			[logo-start] 10.5rem
			[logo-end-sm search-start-sm] 0.75rem
			[logo-end-lg menu-start] 1fr
			[menu-end search-start-lg] minmax(12rem, 14.75rem)
			[search-end];
		grid-auto-flow: column;
		align-items: center;
		gap: var(--space-ls);
		height: var(--header-height);
	}

	.header-bar > * {
		grid-row: 1;
	}

	.logo {
		grid-column: logo-start / logo-end-lg;
		--logo-height: 38px;
	}

	.logo a {
		display: flex;
	}

	nav {
		overflow: hidden;
		grid-column: menu-start / menu-end;
	}

	.search {
		display: grid;
		grid-column: search-start-lg / search-end;
		width: 100%;
		max-width: 14.75rem;
		justify-self: end;
	}

	.show-nav-panel {
		display: flex;
		grid-column: menu-end / search-end;
		background: transparent;
		border: none;
		font-size: 24px;
		padding: 0;
		cursor: pointer;
	}

	.nav-panel {
		display: contents;
	}

	@media (--nav-collapsed) {
		/*
		 * Make the first tap work before Svelte hydrates. Focus keeps the menu
		 * visible while the user moves from the trigger into its controls.
		 */
		.header-bar:has(.show-nav-panel:focus) + .nav-panel :global(nav:not(:has(.dialog))),
		.header-bar
			+ .nav-panel
			:global(nav:not(:has(.dialog)):focus-within:not(:has(button[aria-label='Close navigation panel']:focus))) {
			transform: translateX(0);
		}

		.header-bar {
			grid-template-columns: minmax(0, 1fr) min-content;
		}

		.desktop-only {
			display: none;
		}

		.logo {
			grid-column: 1;
			--logo-height: 32px;
		}

		.search {
			display: none;
		}

		.show-nav-panel {
			grid-column: 2;
			justify-self: end;
		}
	}

	@media (--nav-expanded) {
		.mobile-only {
			display: none;
		}
	}
</style>
