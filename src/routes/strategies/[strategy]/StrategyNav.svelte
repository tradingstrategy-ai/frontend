<script lang="ts">
	import { Menu, MenuItem } from '$lib/components';

	export let strategyId: string;
	export let currentPath: string;
</script>

<nav>
	<Menu horizontal>
		<MenuItem
			noScroll
			label="Overview"
			targetUrl="/strategies/{strategyId}"
			active={currentPath.endsWith(strategyId)}
		/>
		<MenuItem
			noScroll
			label="Open positions"
			targetUrl="/strategies/{strategyId}/open-positions"
			active={currentPath.endsWith('open-positions')}
		/>
		<MenuItem label="Instance status" targetUrl="/strategy/{strategyId}/instance" />
		<MenuItem label="Logs" targetUrl="/strategy/{strategyId}/logs" />
	</Menu>
</nav>

<style lang="postcss">
	nav {
		margin-block: 1.25rem 0.5rem;
		--menu-item-padding: 1rem;
		--menu-item-border-radius: var(--border-radius-md);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-active-color: var(--c-text-default);

		/* quick hack to prevent overflow issues on mobile */
		overflow-x: auto;
	}
</style>
