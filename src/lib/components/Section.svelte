<!--
@component
Layout utility component for displaying a major site section with grid-based content.
- use `header` or `footer` flags specificy HTML element (`section` by default)
- supports optional `header` and `footer` slots in additional default content slot

### Usage:
```tsx
	<Section class="foo" id="bar" padding="md" title="Top trades" cols={2} gap="lg">
		Section content here
	</Section>
```
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SectionSizing } from '$lib/types';
	import Grid from './Grid.svelte';

	export let article = false;
	export let attrs: HTMLAttributes = {};
	let classes: string = '';
	export { classes as class };
	export let cols = 1;
	export let footer = false;
	export let gap: SectionSizing = '';
	export let header = false;
	export let id: string | undefined = undefined;
	export let nav = false;
	export let padding: SectionSizing = '';
	export let size: SectionSizing = '';
	export let subtitle: string = '';
	export let title: string = '';

	$: tag = header ? 'header' : footer ? 'footer' : article ? 'article' : nav ? 'nav' : 'section';
	$: allClasses = ['section', classes, size && `size-${size}`, padding && `padding-${padding}`];
</script>

<svelte:element this={tag} {id} {...attrs} class={allClasses.join(' ')}>
	{#if title || subtitle}
		<header>
			{#if title}
				<h2 class="title">
					{title}
				</h2>
				{#if subtitle}
					<p class="subtitle">{subtitle}</p>
				{/if}
			{/if}
		</header>
	{/if}

	<Grid {cols} {gap}>
		<slot />
	</Grid>

	{#if $$slots.footer}
		<footer>
			<slot name="footer" />
		</footer>
	{/if}
</svelte:element>

<style lang="postcss">
	.section {
		padding: var(--section-padding-y, 0) var(--section-padding-x, 0);

		--section-padding-x: var(--space-xl);
		@media (--viewport-lg-down) {
			--section-padding-x: var(--space-ll);
		}
		@media (--viewport-md-down) {
			--section-padding-x: var(--space-lg);
		}

		@media (--viewport-sm-down) {
			--section-padding-x: var(--space-md);
		}

		& > :global(*) {
			max-width: var(--container-max-width);
			margin: auto;
		}

		& header {
			padding: 0 0 var(--section-padding-y);
			text-align: center;

			& h2 {
				font: var(--f-heading-xl-medium);
			}

			@media (--viewport-md-down) {
				& h2 {
					font: var(--f-heading-xl-medium);
				}
			}

			@media (--viewport-sm-down) {
				& h2 {
					font: var(--f-heading-lg-medium);
				}
			}
		}

		& footer {
			padding: var(--section-padding-y) 0 0;
		}

		& footer,
		& header {
			display: grid;
			place-items: center stretch;
		}

		&.padding-xs {
			--section-padding-y: var(--space-xl);

			@media (--viewport-lg-down) {
				--section-padding-y: var(--space-lg);
			}

			@media (--viewport-md-down) {
				--section-padding-y: var(--space-ls);
			}

			@media (--viewport-sm-down) {
				--section-padding-y: var(--space-ms);
			}
		}

		&.padding-sm {
			--section-padding-y: var(--space-3xl);

			@media (--viewport-lg-down) {
				--section-padding-y: var(--space-lg);
			}

			@media (--viewport-md-down) {
				--section-padding-y: var(--space-ls);
			}

			@media (--viewport-sm-down) {
				--section-padding-y: var(--space-ml);
			}
		}

		&.padding-md {
			--section-padding-y: var(--space-7xl);

			@media (--viewport-lg-down) {
				--section-padding-y: var(--space-4xl);
			}

			@media (--viewport-md-down) {
				--section-padding-y: var(--space-2xl);
			}

			@media (--viewport-sm-down) {
				--section-padding-y: var(--space-xl);
			}
		}
		&.padding-lg {
			--section-padding-y: var(--space-8xl);

			@media (--viewport-lg-down) {
				--section-padding-y: var(--space-5xl);
			}

			@media (--viewport-md-down) {
				--section-padding-y: var(--space-3xl);
			}

			@media (--viewport-sm-down) {
				--section-padding-y: var(--space-xl);
			}
		}

		&.padding-xl {
			--section-padding-y: var(--space-12xl);

			@media (--viewport-lg-down) {
				--section-padding-y: var(--space-9xl);
			}

			@media (--viewport-md-down) {
				--section-padding-y: var(--space-8xl);
			}

			@media (--viewport-sm-down) {
				--section-padding-y: var(--space-6xl);
			}
		}
	}

	.subtitle {
		font: var(--f-ui-xl-roman);
		@media (--viewport-xs) {
			font: var(--f-ui-lg-roman);
		}
		margin-top: var(--space-md);
	}

	.section :global .grid > :is(p, li) {
		font: var(--f-ui-lg-roman);
		margin-bottom: var(--space-lg);

		@media (--viewport-xs) {
			font: var(--f-ui-md-roman);
		}
	}

	.size-xs {
		max-width: 40rem !important;
		margin: auto;
	}

	.size-sm {
		max-width: 48rem !important;
		margin: auto;
	}
</style>
