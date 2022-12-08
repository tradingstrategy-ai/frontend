<script lang="ts">
	import { Button, Menu, MenuItem } from '$lib/components';
	import windowInnerWidth from '$lib/window-inner-width';

	export let strategyId: string;
	export let currentPath: string;

	let detailsEl: HTMLDetailsElement;

	$: tag = $windowInnerWidth <= 1024 ? 'details' : 'aside';

	const closeDetails = () => {
		detailsEl.open = false;
	};
</script>

<svelte:element this={tag} bind:this={detailsEl} class="strategy-nav">
	<summary>
		<Button icon="menu" quarternary />
	</summary>
	<nav>
		<Menu>
			<MenuItem
				noScroll
				label="Overview"
				targetUrl="/strategies/{strategyId}"
				active={currentPath.endsWith(strategyId)}
				on:click={closeDetails}
			/>
			<MenuItem
				noScroll
				label="Open positions"
				targetUrl="/strategies/{strategyId}/open-positions"
				active={currentPath.endsWith('open-positions')}
				on:click={closeDetails}
			/>
			<MenuItem label="Instance status" targetUrl="/strategy/{strategyId}/instance" on:click={closeDetails} />
			<MenuItem label="Logs" targetUrl="/strategy/{strategyId}/logs" on:click={closeDetails} />
		</Menu>
	</nav>
</svelte:element>

<style lang="postcss">
	nav {
		--menu-item-padding: 1rem;
		--menu-item-border-radius: var(--border-radius-md);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-active-color: var(--c-text-default);
	}

	nav :global(menu) {
		padding: 0 !important;
	}

	summary {
		display: grid;
		gap: 1rem;
		list-style: none;
		-webkit-tap-highlight-color: transparent;
	}

	@media (--viewport-lg-up) {
		summary {
			display: none;
		}
	}

	summary :global(button) {
		pointer-events: none;

		&::before {
			content: 'Show menu';
		}
	}

	:global {
		& .strategy-nav[open] summary {
			margin-bottom: 1rem;
			opacity: 0.4;

			& :global(button)::before {
				content: 'Hide menu';
			}
		}
	}
</style>
