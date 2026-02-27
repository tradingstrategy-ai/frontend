<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import NavPanel from '$lib/components/NavPanel.svelte';
	// NOTE: un-comment below line to bring back search box
	// import TextInput from '$lib/components/TextInput.svelte';
	import IconMenu from '~icons/local/menu';
	import ColorModePicker from '$lib/header/ColorModePicker.svelte';

	let panelOpen = false;
</script>

<div class="header-bar">
	<div class="logo">
		<a href="/" aria-label="Home">
			<Logo />
		</a>
	</div>

	<nav class="desktop-only">
		<Menu horizontal align="center">
			<slot name="menu" />
		</Menu>
	</nav>

	<!-- NOTE: un-comment below section to bring back search box -->
	<!--
	<div class="search">
		<slot name="search">
			<TextInput type="search" --text-input-width="100%" />
		</slot>
	</div>
	-->

	<div class="desktop-only">
		<ColorModePicker />
	</div>

	<button class="show-nav-panel mobile-only" aria-label="Show navigation panel" on:click={() => (panelOpen = true)}>
		<IconMenu />
	</button>
</div>

<div class="nav-panel mobile-only">
	<NavPanel bind:open={panelOpen}>
		<slot name="menu" />
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
			[menu-end search-start-lg] auto /* NOTE: replace `auto` with the `minmax(auto, 12rem)` to bring back search box */
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

	/* NOTE: un-comment below section to bring back search box */
	/*
	.search {
		display: none;
		grid-column: search-start-lg / search-end;
		width: 100%;
		max-width: 14.75rem;
		justify-self: end;
	}
	*/

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
		.desktop-only {
			display: none;
		}

		.logo {
			grid-column-end: logo-end-sm;
			--logo-height: 32px;
		}

		/* NOTE: un-comment below section to bring back search box */
		/*
		.search {
			grid-column-start: search-start-sm;
		}
		*/
	}

	@media (--nav-expanded) {
		.mobile-only {
			display: none;
		}
	}
</style>
