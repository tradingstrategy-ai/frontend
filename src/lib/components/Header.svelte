<script lang="ts">
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';
	import Menu from './Menu.svelte';
	import NavPanel from './NavPanel.svelte';
	import TextInput from './TextInput.svelte';

	let hasOverflow = false;
	let panelOpen = false;

	function checkOverflow(node: HTMLElement) {
		const ro = new ResizeObserver(() => {
			hasOverflow = node.scrollWidth > node.clientWidth;
		});
		ro.observe(node);
		return { destroy: () => ro.unobserve(node) };
	}
</script>

<header class:hasOverflow>
	<div class="logo">
		<a href="/"><Logo /></a>
	</div>

	<nav use:checkOverflow data-cy="navbar">
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

<NavPanel hidden={!hasOverflow} bind:open={panelOpen}>
	<slot name="menu" />
</NavPanel>

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

	.hasOverflow {
		height: 3.75rem;
	}

	.logo {
		grid-column: logo-start / logo-end-lg;
		--logo-height: 38px;
	}

	.hasOverflow .logo {
		grid-column-end: logo-end-sm;
		--logo-height: 32px;
	}

	.logo a {
		display: flex;
	}

	nav {
		overflow: hidden;
		grid-column: menu-start / menu-end;
	}

	.hasOverflow nav {
		visibility: hidden;
	}

	.search {
		grid-column: search-start-lg / search-end;
		width: 100%;
		max-width: 14.75rem;
		justify-self: end;
	}

	.hasOverflow .search {
		grid-column-start: search-start-sm;
	}

	.show-nav-panel {
		display: flex;
		background: transparent;
		border: none;
		font-size: 24px;
		padding: 0;
		cursor: pointer;
	}

	:not(.hasOverflow) .show-nav-panel {
		display: none;
	}
</style>
