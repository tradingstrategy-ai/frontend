<script lang="ts">
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';
	import Menu from './Menu.svelte';
	import NavPanel from './NavPanel.svelte';

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

	<nav use:checkOverflow>
		<Menu horizontal align="center">
			<slot />
		</Menu>
	</nav>

	<!-- TODO: move to separeate component; toggle to icon on small displays -->
	<div class="search">
		<input type="search" placeholder="Search" />
		<Icon name="search" />
	</div>

	<button class="show-nav-panel" on:click={() => (panelOpen = true)}>
		<Icon name="menu" />
	</button>
</header>

<NavPanel hidden={!hasOverflow} bind:open={panelOpen}>
	<slot />
</NavPanel>

<style>
	header {
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: auto 1fr minmax(auto, 14.75rem);
		align-items: center;
		gap: 1rem;
		height: 5.5rem;
		padding: 0 0.5rem;
	}

	.hasOverflow {
		height: 3.75rem;
	}

	.logo {
		--logo-height: 38px;
	}

	.hasOverflow .logo {
		--logo-height: 32px;
	}

	.logo a {
		display: flex;
		min-width: 200px;
	}

	nav {
		overflow: hidden;
	}

	.hasOverflow nav {
		visibility: hidden;
	}

	button {
		display: flex;
		background: transparent;
		border: none;
		font-size: 24px;
		padding: 0;
		cursor: pointer;
	}

	/* TODO: move to separate component */
	.search {
		position: relative;
	}

	input[type='search'] {
		border: 2px solid var(--c-text-1);
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		padding: 0 1rem 0 1.5rem;
		width: 100%;
		height: 2.125rem;
		font: 500 14px/14px var(--ff-display);
		background: var(--c-body);
		outline: none;
	}

	.search :global(svg) {
		font-size: 14px;
		position: absolute;
		top: 0.625rem;
		left: 0.5rem;
	}

	:not(.hasOverflow) .show-nav-panel {
		display: none;
	}
</style>
