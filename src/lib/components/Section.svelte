<!--
@component
Responsive layout utility for delineating a horizontal page section with appropriate margins. Use
with a nested `Grid` component to create multi-column layouts.

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
		`--padding-y: var(--spacing-${padding})`,
		`--gap: var(--spacing-${gap})`,
		`--size: var(--size-${maxWidth})`
	];
</script>

<svelte:element this={tag} {...ariaAttrs} class="section" style={styles.join(';')}>
	<slot />
</svelte:element>

<style lang="postcss">
	.section {
		background: var(--section-background, inherit);
		display: grid;
		gap: var(--section-gap, var(--gap));
		padding-block: var(--section-padding, var(--padding-y));
		padding-inline: calc((100% - var(--width)) / 2);
		--width: min(calc(100% - (var(--padding-x) * 2)), var(--size));
		--padding-x: var(--space-xl);

		--size-xs: 40rem;
		--size-sm: 48rem;
		--size-md: 64rem;
		--size-lg: 80rem;
		--size-xl: 86rem;

		/* Shared spacing variables (used for padding and gap) */
		--spacing-xs: var(--space-xl);
		--spacing-sm: var(--space-3xl);
		--spacing-md: var(--space-7xl);
		--spacing-lg: var(--space-8xl);
		--spacing-xl: var(--space-12xl);

		@media (--viewport-lg-down) {
			--padding-x: var(--space-ll);
			--spacing-xs: var(--space-lg);
			--spacing-sm: var(--space-lg);
			--spacing-md: var(--space-4xl);
			--spacing-lg: var(--space-5xl);
			--spacing-xl: var(--space-9xl);
		}

		@media (--viewport-md-down) {
			--padding-x: var(--space-lg);
			--spacing-xs: var(--space-ls);
			--spacing-sm: var(--space-ls);
			--spacing-md: var(--space-2xl);
			--spacing-lg: var(--space-3xl);
			--spacing-xl: var(--space-8xl);
		}

		@media (--viewport-sm-down) {
			--padding-x: var(--space-md);
			--spacing-xs: var(--space-ms);
			--spacing-sm: var(--space-ml);
			--spacing-md: var(--space-xl);
			--spacing-lg: var(--space-xl);
			--spacing-xl: var(--space-6xl);
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
