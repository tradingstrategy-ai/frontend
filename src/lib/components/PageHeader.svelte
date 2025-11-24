<!--
@component
Display single- or double-line page header. `title`, `subtitle` can be passed as props (simple
strings) or named slots (for nested markup); `description` can be a prop or default slot.

@example

```svelte
  <PageHeader title="Main page title" subtitle="optional secondary page title" />
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string | Snippet;
		subtitle?: string | Snippet;
		cta?: Snippet;
	}

	let { title, subtitle, cta }: Props = $props();
</script>

<header class="page-header ds-container">
	<h1 class:multiline={subtitle}>
		{#if title instanceof Function}
			{@render title()}
		{:else}
			{title}
		{/if}

		{#if subtitle instanceof Function}
			<small>{@render subtitle()}</small>
		{:else if subtitle}
			<small>{subtitle}</small>
		{/if}
	</h1>

	{@render cta?.()}
</header>

<style>
	.page-header {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-ms);
		align-items: center;

		@media (--viewport-md-up) {
			grid-auto-flow: column;
		}

		h1 {
			font: var(--f-h1-medium);
		}

		.multiline {
			display: grid;
			font-weight: 700;
		}

		small {
			font: var(--f-h4-medium);
			color: var(--c-text-extra-light);
		}
	}
</style>
