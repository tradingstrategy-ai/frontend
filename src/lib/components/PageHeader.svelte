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
	export let title: string = '';
	export let subtitle: string = '';
	export let description: string = '';
</script>

<header class="page-header ds-container">
	<h1 class:multiline={subtitle}>
		<slot name="title">{title}</slot>
		{#if $$slots.subtitle || subtitle}
			<small>
				<slot name="subtitle">{subtitle}</slot>
			</small>
		{/if}
	</h1>
	{#if $$slots.default || description}
		<p>
			<slot>{description}</slot>
		</p>
	{/if}
</header>

<style lang="postcss">
	.page-header {
		gap: var(--page-header-gap, var(--space-sl));

		& h1 {
			font: var(--f-h1-medium);
		}

		& .multiline {
			font-weight: 700;
		}

		& small {
			display: block;
			font: var(--f-h4-medium);
			color: var(--c-text-2-v1);
		}

		& p {
			font: var(--f-h3-roman);

			@media (--viewport-md-down) {
				font: var(--f-h4-roman);
			}

			& :global a {
				text-decoration: underline;
				font-weight: 700;
			}
		}
	}
</style>
