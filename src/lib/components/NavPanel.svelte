<script lang="ts">
	import { Logo, Icon, Menu, Footer } from '$lib/components';
	import ColorModePicker from '$lib/header/ColorModePicker.svelte';

	export let hidden = false;
	export let open = false;

	const close = () => (open = false);
</script>

{#if !hidden}
	<nav class:open>
		<header>
			<a href="/" aria-label="Home" on:click={close}><Logo /></a>
			<button on:click={close}>
				<Icon name="cancel" />
			</button>
		</header>
		<Menu align="center" on:click={close}>
			<slot />
		</Menu>
		<Footer small />
		<div class="color-mode-picker">
			<ColorModePicker showLabel />
		</div>
	</nav>
{/if}

<style lang="postcss">
	nav {
		position: fixed;
		z-index: 99;
		top: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		max-width: 420px;
		padding: 1rem;
		overflow-y: auto;
		display: grid;
		gap: 1.5rem;
		grid-auto-rows: min-content;
		background: var(--c-body-v1);
		box-shadow: -0.25rem 0 2rem var(--c-shadow-1-v1);
		transform: translateX(calc(100% + 2rem));
		transition: transform 0.25s;

		&.open {
			transform: translateX(0);
		}
	}

	header {
		display: grid;
		grid-template-columns: min-content auto;
		align-items: center;
		padding-bottom: 1rem;
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
		margin-top: 1.5rem;
		display: grid;
	}
</style>
