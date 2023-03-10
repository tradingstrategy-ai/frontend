<script lang="ts">
	import type { SectionSizing } from '$lib/types';
	import type { AriaAttributes } from 'svelte/elements';

	export let ariaAttrs: AriaAttributes = {};
	export let gap: SectionSizing = 'none';
	export let padding: SectionSizing = 'none';
	export let size: 'xs' | 'sm' | undefined = undefined;
	export let tag: 'header' | 'footer' | 'article' | 'nav' | 'section' = 'section';

	$: classNames = `section padding-${padding} gap-${gap} ${size ? `size-${size}` : ''}`;
</script>

<svelte:element this={tag} class={classNames} {...ariaAttrs}>
	<slot />
</svelte:element>

<style lang="postcss">
	.section {
		--private-width: min(calc(100% - (var(--private-padding-x) * 2)), var(--container-max-width));

		background: var(--section-background, inherit);
		display: grid;
		gap: var(--section-gap, var(--private-gap));
		padding-block: var(--section-padding, var(--private-padding-y));
		padding-inline: calc((100% - var(--private-width)) / 2);

		/* Shared spacing layer (used for padding and gap) */
		--private-padding-x: var(--space-xl);
		--private-spacing-xs: var(--space-xl);
		--private-spacing-sm: var(--space-3xl);
		--private-spacing-md: var(--space-7xl);
		--private-spacing-lg: var(--space-8xl);
		--private-spacing-xl: var(--space-12xl);

		@media (--viewport-lg-down) {
			--private-padding-x: var(--space-ll);
			--private-spacing-xs: var(--space-lg);
			--private-spacing-sm: var(--space-lg);
			--private-spacing-md: var(--space-4xl);
			--private-spacing-lg: var(--space-5xl);
			--private-spacing-xl: var(--space-9xl);
		}

		@media (--viewport-md-down) {
			--private-padding-x: var(--space-lg);
			--private-spacing-xs: var(--space-ls);
			--private-spacing-sm: var(--space-ls);
			--private-spacing-md: var(--space-2xl);
			--private-spacing-lg: var(--space-3xl);
			--private-spacing-xl: var(--space-8xl);
		}

		@media (--viewport-sm-down) {
			--private-padding-x: var(--space-md);
			--private-spacing-xs: var(--space-ms);
			--private-spacing-sm: var(--space-ml);
			--private-spacing-md: var(--space-xl);
			--private-spacing-lg: var(--space-xl);
			--private-spacing-xl: var(--space-6xl);
		}
	}

	/* Padding levels */
	.padding-none {
		--private-padding-y: 0;
	}
	.padding-xs {
		--private-padding-y: var(--private-spacing-xs);
	}
	.padding-sm {
		--private-padding-y: var(--private-spacing-sm);
	}
	.padding-md {
		--private-padding-y: var(--private-spacing-md);
	}
	.padding-lg {
		--private-padding-y: var(--private-spacing-lg);
	}
	.padding-xl {
		--private-padding-y: var(--private-spacing-xl);
	}

	/* Gap levels */
	.gap-none {
		--private-gap: 0;
	}
	.gap-xs {
		--private-gap: var(--private-spacing-xs);
	}
	.gap-sm {
		--private-gap: var(--private-spacing-sm);
	}
	.gap-md {
		--private-gap: var(--private-spacing-md);
	}
	.gap-lg {
		--private-gap: var(--private-spacing-lg);
	}
	.gap-xl {
		--private-gap: var(--private-spacing-xl);
	}

	.size-xs {
		--container-max-width: 40rem;
	}
	.size-sm {
		--container-max-width: 48rem;
	}

	/* TODO: move font settings somewhere else */
	.section :global {
		& > h2,
		& > header > h2 {
			font: var(--f-heading-xl-medium);

			@media (--viewport-sm-down) {
				font: var(--f-heading-lg-medium);
			}
		}

		& > p,
		& > header > p {
			font: var(--f-ui-lg-roman);

			@media (--viewport-xs) {
				font: var(--f-ui-md-roman);
			}
		}
	}
</style>
