<script lang="ts">
	import { Button, Menu, MenuItem } from '$lib/components';
	import windowInnerWidth from '$lib/window-inner-width';

	export let strategyId: string;
	export let currentPath: string;

	let detailsEl: HTMLDetailsElement;

	$: tag = $windowInnerWidth <= 576 ? 'details' : 'aside';

	const closeDetails = () => {
		detailsEl.open = false;
	};

	$: mobileToggleTitle = currentPath.endsWith(strategyId)
		? 'Overview'
		: currentPath.endsWith('open-positions')
		? 'Open positions'
		: currentPath.endsWith('closed-positions')
		? 'Closed positions'
		: currentPath.endsWith('instance')
		? 'Instance status'
		: currentPath.endsWith('logs')
		? 'Logs'
		: currentPath.endsWith('performance')
		? 'Performance'
		: currentPath.endsWith('decision-making')
		? 'Decision making'
		: currentPath.endsWith('source')
		? 'Source code'
		: currentPath.endsWith('logs')
		? 'Logs'
		: '';
</script>

<svelte:element this={tag} bind:this={detailsEl} class="strategy-nav">
	<summary>
		<Button icon="chevron-down" quarternary>
			{mobileToggleTitle}
		</Button>
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
		--menu-item-active-color: var(--c-text-default);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-border-radius: var(--border-radius-md);
		--menu-item-padding: 0.875rem 1rem;
		@media (--viewport-sm-up) {
			--menu-item-padding: 0.75rem 1.125rem;
		}
		@media (--viewport-md-down) {
			--menu-item-font: var(--f-ui-md-medium);
		}
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

	@media (--viewport-sm-up) {
		summary {
			display: none;
		}
	}

	summary :global(button) {
		pointer-events: none;
	}

	:global {
		& .strategy-nav button svg {
			transition: all 0.25s ease-out;

			& path {
				stroke-width: 3px !important;
			}
		}
		& .strategy-nav[open] {
			& summary {
				margin-bottom: 1.25rem;
				opacity: 0.4;
			}

			& button svg {
				transform: rotate(180deg) !important;
			}
		}
	}
</style>
