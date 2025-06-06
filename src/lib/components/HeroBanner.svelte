<!--
@component
Hero banner used as heading on various pages (Community, Trading data, Blog roll).

@example

```svelte
	<HeroBanner {image} {title} {subtitle}>
		Optional slot content.
	</HeroBanner>
```
-->
<script lang="ts">
	export let image: string | undefined = undefined;
	export let title: string;
	export let subtitle = '';
	export let hr = false;
</script>

<div class="hero-banner" class:has-image={image}>
	<div class="content">
		<h1>{@html title}</h1>
		<div class="subtitle">
			<slot name="subtitle">{@html subtitle}</slot>
		</div>
		{#if hr}
			<hr />
		{/if}
		<slot />
	</div>

	{#if image}
		<div class="media">
			{@html image}
		</div>
	{/if}
</div>

<style>
	.hero-banner {
		display: grid;
		gap: var(--space-10xl);
		padding: var(--space-md) 0;
		place-items: stretch;

		@media (--viewport-sm-down) {
			min-height: max(22vh, 12rem);
			gap: var(--space-lg);
			grid-template-columns: 1fr;
		}

		&.has-image {
			place-content: center;

			@media (--viewport-md-up) {
				grid-template-columns: 1fr minmax(12rem, min(28vw, 32rem));
			}

			@media (--viewport-md) {
				min-height: max(40vh, 32rem);
			}
		}
	}

	.content {
		display: grid;
		gap: var(--space-sm);
		place-content: center stretch;

		h1 {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);

			@media (--viewport-md-up) {
				font: var(--f-heading-xl-medium);
				letter-spacing: var(--f-heading-xl-spacing, normal);
			}
		}

		.subtitle {
			margin: 0;
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);

			@media (--viewport-xs) {
				font: var(--f-ui-lg-roman);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}
	}

	.media {
		@media (--viewport-sm-down) {
			display: none;
		}

		:global(svg) {
			max-height: min(28rem, 64vw);
			margin: auto;

			:global(*) {
				fill: currentColor;
			}
		}
	}

	hr {
		width: 100%;
		margin: var(--space-lg) 0;
		border: 1px solid var(--c-text);

		@media (--viewport-lg-down) {
			margin: var(--space-md) 0;
		}

		@media (--viewport-sm-down) {
			display: none;
		}
	}
</style>
