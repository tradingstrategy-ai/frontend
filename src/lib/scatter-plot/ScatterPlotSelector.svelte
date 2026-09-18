<!--
@component
Selector linking between vault scatter plot chart pages.

@example
```svelte
  <ScatterPlotSelector />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { vaultChartLinks } from '$lib/top-vaults/vault-chart-links';

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="scatter-plot-selector">
	<span class="label">See charts:</span>
	{#each vaultChartLinks as { href, label } (href)}
		<a href={resolve(href)} class:active={isActive(href)}>{label}</a>
	{/each}
</nav>

<style>
	.scatter-plot-selector {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		column-gap: 0.75rem;
		row-gap: 0.35rem;
		padding-top: 1.75rem;
		font: var(--f-ui-md-medium);
		color: var(--c-text-extra-light);

		@media (--viewport-sm-down) {
			flex-direction: column;
			align-items: center;
			gap: 0.25em;
		}
	}

	.label {
		color: var(--c-text-light);
	}

	a {
		color: var(--c-text-extra-light);
		text-decoration: none;
		transition: color var(--time-sm);

		&:hover {
			color: var(--c-text);
		}

		&.active {
			color: var(--c-text);
			font-weight: 700;
		}
	}
</style>
