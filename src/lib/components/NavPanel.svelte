<script lang="ts">
	import { Logo, Menu, Footer } from '$lib/components';
	import IconCancel from '~icons/local/cancel';
	import ColorModePicker from '$lib/header/ColorModePicker.svelte';
	import { disableScroll } from '$lib/actions/scroll';

	export let open = false;

	const close = () => (open = false);
</script>

<svelte:body use:disableScroll={open} />

<nav class:open>
	<header>
		<a href="/" aria-label="Home" on:click={close}><Logo /></a>
		<button aria-label="Close navigation panel" on:click={close}>
			<IconCancel />
		</button>
	</header>
	<Menu align="center" on:click={close}>
		<slot />
	</Menu>
	<div class="color-mode-picker">
		<ColorModePicker showLabel />
	</div>
	<Footer small />
</nav>

<style>
	nav {
		position: fixed;
		z-index: 99;
		top: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		max-width: 420px;
		padding: var(--space-md);
		overflow-y: auto;
		display: grid;
		gap: var(--space-lg);
		grid-auto-rows: min-content;
		background: var(--c-body);
		box-shadow: var(--shadow-1);
		transform: translateX(calc(100% + var(--space-xl)));
		transition: transform 0.25s;

		&.open {
			transform: translateX(0);
		}
	}

	header {
		display: grid;
		grid-template-columns: min-content auto;
		align-items: center;
		padding-bottom: var(--space-md);
		--logo-height: 32px;
	}

	button {
		display: flex;
		justify-content: flex-end;
		background: transparent;
		border: none;
		font-size: 16px;
		padding: 0;
		cursor: pointer;
	}

	.color-mode-picker {
		margin-top: var(--space-lg);
		display: grid;
	}
</style>
