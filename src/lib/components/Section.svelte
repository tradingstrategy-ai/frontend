<script lang="ts">
	import type { SectionSizing } from '$lib/types';
	import Grid from './Grid.svelte';

	let classes: string = '';
	export { classes as class };
	export let cols = 1;
	export let gap: SectionSizing = '';
	export let layout: 'boxed' | 'fullwidth' | 'padded' | '' = '';
	export let size: SectionSizing = '';
	export let subtitle: string = '';
	export let title: string = '';
</script>

<section class="{classes} {size} {layout}">
	{#if $$slots.header || title || subtitle}
		<header>
			{#if $$slots.header || title}
				<h2 class="title">
					<slot name="header">
						{title}
					</slot>
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
</section>

<style lang="postcss">
	section {
		--section-padding-x: var(--space-xl);
		--section-padding-y: var(--space-8xl);

		@media (--viewport-lg-down) {
			--section-padding-x: var(--space-xl);
			--section-padding-y: var(--space-6xl);
		}

		@media (--viewport-md-down) {
			--section-padding-x: var(--space-lg);
			--section-padding-y: var(--space-4xl);
		}

		@media (--viewport-sm-down) {
			--section-padding-x: var(--space-md);
			--section-padding-y: var(--space-lg);
		}
	}

	header {
		text-align: center;

		& h2 {
			font: var(--f-heading-xl-medium);
		}

		@media (--viewport-sm-down) {
			& h2 {
				font: var(--f-heading-lg-medium);
			}
		}

		@media (--viewport-md-down) {
			& h2 {
				font: var(--f-heading-xl-medium);
			}
		}
	}

	.boxed,
	.padded {
		padding: var(--section-padding-y) var(--section-padding-x);

		& header {
			padding: 0 0 var(--section-padding-y);
		}

		& footer {
			padding: var(--section-padding-y) 0 0;
		}
	}

	.boxed > :global(*) {
		max-width: var(--container-max-width);
		margin: auto;
	}
</style>
