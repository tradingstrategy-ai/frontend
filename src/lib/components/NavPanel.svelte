<script lang="ts">
	import Menu from './Menu.svelte';
	import Icon from './Icon.svelte';
	import Footer from './Footer.svelte';

	export let hidden = false;
	export let open = false;

	const close = () => (open = false);
</script>

{#if !hidden}
	<nav class:open>
		<header>
			<h4>Menu</h4>
			<button on:click={close}>
				<Icon name="cancel" />
			</button>
		</header>
		<Menu align="center" on:click={close}>
			<slot />
		</Menu>
		<Footer small />
	</nav>
{/if}

<style>
	nav {
		position: fixed;
		z-index: 99;
		top: 0;
		right: 0;
		bottom: 0;
		box-sizing: border-box;
		width: 100%;
		max-width: 420px;
		padding: 1rem 1rem max(1rem, 4vh) 1rem;
		display: grid;
		gap: 2rem;
		grid-template-rows: auto auto 1fr auto;
		align-items: end;
		background: var(--c-body);
		box-shadow: 0.25rem 0 2rem var(--c-border-1);
		transform: translateX(calc(100% + 2rem));
		transition: transform 0.25s;
	}

	nav.open {
		transform: translateX(0);
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	h4 {
		font: 600 var(--fs-heading-sm);
	}

	button {
		display: flex;
		background: transparent;
		border: none;
		font-size: 16px;
		padding: 0;
		cursor: pointer;
	}

	.footer {
		/* position: absolute;
		bottom: 4rem;
		left: 0;
		right: 0; */
	}
</style>
