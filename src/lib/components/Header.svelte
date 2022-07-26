<script lang="ts">
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';
	import Menu from './Menu.svelte';
	import NavPanel from './NavPanel.svelte';
	import TextInput from './TextInput.svelte';

	let panelOpen = false;
</script>

<header>
	<div class="logo">
		<a href="/"><Logo /></a>
	</div>

	<nav>
		<Menu horizontal align="center">
			<slot name="menu" />
		</Menu>
	</nav>

	<div class="search">
		<slot name="search">
			<TextInput type="search" --text-input-width="100%" />
		</slot>
	</div>

	<button class="show-nav-panel" on:click={() => (panelOpen = true)}>
		<Icon name="menu" />
	</button>
</header>

<div class="nav-panel">
	<NavPanel bind:open={panelOpen}>
		<slot name="menu" />
	</NavPanel>
</div>

<style>
	header {
		display: grid;
		/* prettier-ignore */
		grid-template-columns: [logo-start] 10.5rem [logo-end-sm search-start-sm] 2rem [logo-end-lg menu-start] 1fr [menu-end search-start-lg] minmax(auto, 14.75rem) [search-end];
		grid-auto-flow: column;
		align-items: center;
		gap: 1rem;
		height: 5.5rem;
		padding: 0 0.5rem;
	}

	header > * {
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
		grid-column: search-start-lg / search-end;
		width: 100%;
		max-width: 14.75rem;
		justify-self: end;
	}

	.show-nav-panel {
		/* hidden by default; display: flex in @media query below */
		display: none;
		background: transparent;
		border: none;
		font-size: 24px;
		padding: 0;
		cursor: pointer;
	}

	.nav-panel {
		/* hidden by default; display: contents in @media query below */
		display: none;
	}

	@media (max-width: 1150px) {
		header {
			height: 3.75rem;
		}

		nav {
			display: none;
		}

		.logo {
			grid-column-end: logo-end-sm;
			--logo-height: 32px;
		}

		.search {
			grid-column-start: search-start-sm;
		}

		.show-nav-panel {
			display: flex;
		}

		.nav-panel {
			display: contents;
		}
	}
</style>
