<!--
@component
Display single- or double-line page header. `title`, `subtitle` can be passed as props (simple
strings) or named slots (for nested markup); `description` can be a prop or default slot.

#### Usage
```tsx
  <PageHeader title="Main page title" subtitle="optional secondary page title" />
```
-->
<script lang="ts">
	export let title = '';
	export let subtitle = '';
</script>

<header class="page-header ds-container">
	<h1 class:multiline={$$slots.subtitle || subtitle}>
		<slot name="title">{title}</slot>
		{#if $$slots.subtitle || subtitle}
			<small>
				<slot name="subtitle">{subtitle}</slot>
			</small>
		{/if}
	</h1>
	<slot name="cta" />
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
