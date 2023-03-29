<!--
@component
Responsive layout utility for delineating a horizontal page section with appropriate margins. Use
with a nested `Grid` component to create multi-column layouts.

CSS overrides: `--section-padding`, `--section-gap`, `--section-background`

#### Usage:
```tsx
	<Section padding="md" gap="sm">
		<h2>Section heading</h2>
		<Grid cols={3} gap="lg">
			your nested grid elements here
		</Grid>
	</Section>
```
-->
<script lang="ts">
	import type { AriaAttributes } from 'svelte/elements';

	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	export let ariaAttrs: AriaAttributes = {};
	export let gap: Size | undefined = undefined;
	export let padding: Size | undefined = undefined;
	export let maxWidth: Size = 'xl';
	export let tag: 'header' | 'footer' | 'article' | 'nav' | 'section' = 'section';

	const styles = [
		`--SECTION-padding-y: var(--SECTION-spacing-${padding})`,
		`--SECTION-gap: var(--SECTION-spacing-${gap})`,
		`--SECTION-max-width: var(--SECTION-max-width-${maxWidth})`
	];
</script>

<svelte:element this={tag} {...ariaAttrs} class="section" style={styles.join(';')}>
	<slot />
</svelte:element>

<style lang="postcss">
	.section {
		background: var(--section-background, inherit);
		display: grid;
		gap: var(--section-gap, var(--SECTION-gap));
		padding-block: var(--section-padding, var(--SECTION-padding-y));
		padding-inline: calc((100% - var(--SECTION-width)) / 2);
		--SECTION-width: min(calc(100% - (var(--SECTION-padding-x) * 2)), var(--SECTION-max-width));
		--SECTION-padding-x: var(--space-xl);

		--SECTION-max-width-xs: 40rem;
		--SECTION-max-width-sm: 48rem;
		--SECTION-max-width-md: 64rem;
		--SECTION-max-width-lg: 80rem;
		--SECTION-max-width-xl: 86rem;

		/* Shared spacing variables (used for padding and gap) */
		--SECTION-spacing-xs: var(--space-xl);
		--SECTION-spacing-sm: var(--space-3xl);
		--SECTION-spacing-md: var(--space-7xl);
		--SECTION-spacing-lg: var(--space-8xl);
		--SECTION-spacing-xl: var(--space-12xl);

		@media (--viewport-lg-down) {
			--SECTION-padding-x: var(--space-ll);
			--SECTION-spacing-xs: var(--space-lg);
			--SECTION-spacing-sm: var(--space-lg);
			--SECTION-spacing-md: var(--space-4xl);
			--SECTION-spacing-lg: var(--space-5xl);
			--SECTION-spacing-xl: var(--space-9xl);
		}

		@media (--viewport-md-down) {
			--SECTION-padding-x: var(--space-lg);
			--SECTION-spacing-xs: var(--space-ls);
			--SECTION-spacing-sm: var(--space-ls);
			--SECTION-spacing-md: var(--space-2xl);
			--SECTION-spacing-lg: var(--space-3xl);
			--SECTION-spacing-xl: var(--space-8xl);
		}

		@media (--viewport-sm-down) {
			--SECTION-padding-x: var(--space-md);
			--SECTION-spacing-xs: var(--space-ms);
			--SECTION-spacing-sm: var(--space-ml);
			--SECTION-spacing-md: var(--space-xl);
			--SECTION-spacing-lg: var(--space-xl);
			--SECTION-spacing-xl: var(--space-6xl);
		}
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
