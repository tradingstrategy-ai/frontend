<!--
@component
Responsive navigation drawer with optional search entry, primary links and site footer.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Logo, Menu, Footer } from '$lib/components';
	import IconCancel from '~icons/local/cancel';
	// NOTE: un-comment below line to bring back color mode picker
	// import ColorModePicker from '$lib/header/ColorModePicker.svelte';

	interface Props {
		open?: boolean;
		children?: Snippet;
		panelSearch?: Snippet;
		onClose?: () => void;
	}

	let { open = $bindable(false), children, panelSearch, onClose }: Props = $props();

	function close() {
		open = false;
		onClose?.();
	}

	function closeOnNavigation(node: HTMLElement) {
		function handleClick(event: MouseEvent) {
			if (event.target instanceof Element && event.target.closest('a[href]')) close();
		}

		node.addEventListener('click', handleClick);
		return { destroy: () => node.removeEventListener('click', handleClick) };
	}
</script>

<nav class:open aria-label="Mobile navigation" use:closeOnNavigation>
	<header>
		<a href="/" aria-label="Home"><Logo /></a>
		<button aria-label="Close navigation panel" onclick={close}>
			<IconCancel />
		</button>
	</header>
	{#if panelSearch}
		<div class="panel-search">
			{@render panelSearch()}
		</div>
	{/if}
	<Menu align="center">
		{@render children?.()}
	</Menu>
	<!-- NOTE: un-comment below section to bring back color mode picker -->
	<!--
	<div class="color-mode-picker">
		<ColorModePicker showLabel />
	</div>
	-->
	<Footer small />
</nav>

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

	.panel-search {
		width: min(100%, 22rem);
		justify-self: center;
		padding-inline: var(--space-md);
	}

	@media (--nav-collapsed) {
		nav {
			max-width: none;
			transition: none;
		}
	}

	@media (--nav-collapsed) and (--viewport-sm-up) {
		.panel-search {
			width: 31.25rem;
			padding-inline: 0;
		}
	}

	@media (--viewport-xs) {
		nav:has(:global(.dialog)) {
			box-sizing: border-box;
			width: 100%;
			max-width: none;
			height: 100dvh;
			padding: 0;
			overflow: hidden;
			transform: none;

			/* Keep the established navigation identity visible above full-screen search. */
			header {
				position: relative;
				z-index: 1001;
				padding: var(--space-md);
			}

			header a,
			header button {
				position: relative;
				z-index: 1;
			}
		}

		nav:has(:global(.dialog)) :global(.dialog) {
			padding-top: max(calc(var(--header-height) + var(--space-md)), env(safe-area-inset-top));
		}
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

	/* NOTE: un-comment below section to bring back color mode picker
	.color-mode-picker {
		margin-top: var(--space-lg);
		display: grid;
	}
	*/
</style>
