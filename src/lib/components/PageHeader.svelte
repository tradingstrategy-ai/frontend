<!--
@component
Display single- or double-line page header

#### Usage
```tsx
  <PageHeader title="Main page title" subtitle="optional secondary page title" />
```
-->
<script lang="ts">
	export let title: string;
	export let subtitle: string = '';
</script>

<header class="ds-container">
	<h1 class:multiline={subtitle}>
		{title}
		{#if subtitle}<small>{subtitle}</small>{/if}
	</h1>
</header>

<style lang="postcss">
	.multiline {
		font-weight: 700;
	}

	small {
		display: block;
		font: var(--f-h4-medium);
		color: var(--c-text-2);
	}
</style>
