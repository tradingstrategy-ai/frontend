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

	const charts = [
		{ href: '/trading-view/vaults/yield-risk', label: 'Yield / Risk' },
		{ href: '/trading-view/vaults/yield-protocol', label: 'Yield / Protocol' }
	] as const;

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="scatter-plot-selector">
	<span class="label">See charts:</span>
	{#each charts as { href, label } (href)}
		<a href={resolve(href)} class:active={isActive(href)}>{label}</a>
	{/each}
</nav>

<style>
	.scatter-plot-selector {
		display: flex;
		justify-content: center;
		gap: 0.5em;
		padding-top: 1rem;
		font: var(--f-ui-md-medium);
		color: var(--c-text-extra-light);
	}

	.label {
		color: var(--c-text-light);
	}

	a {
		color: var(--c-text-extra-light);
		text-decoration: none;
		transition: color var(--time-sm);

		&:not(:first-of-type)::before {
			content: '|';
			color: var(--c-text-ultra-light);
			padding-right: 0.5rem;
		}

		&:hover {
			color: var(--c-text);
		}

		&.active {
			color: var(--c-text);
			font-weight: 700;
		}
	}
</style>
