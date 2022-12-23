<!--
@component
Display single- or double-line page header. The `title` and `subtitle` can be passed
as props (simple strings) or named slots (for nested markup).

#### Usage
```tsx
  <PageHeader title="Main page title" subtitle="optional secondary page title" />
```
-->
<script lang="ts">
	export let title: string = '';
	export let subtitle: string = '';
</script>

<header class="ds-container">
	<h1 class:multiline={subtitle}>
		<slot name="title">{title}</slot>
		{#if $$slots.subtitle || subtitle}
			<small>
				<slot name="subtitle">{subtitle}</slot>
			</small>
		{/if}
	</h1>
</header>

<style lang="postcss">
	.multiline {
		font-weight: 700;
	}

	small {
		display: block;
		font: var(--f-h4-medium);
		color: var(--c-text-2-v1);
	}
</style>
