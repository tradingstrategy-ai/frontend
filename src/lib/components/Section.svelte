<script lang="ts">
	import type { SectionSizing } from '$lib/types';
	import Grid from './Grid.svelte';

	let classes: string = '';
	export { classes as class };
	export let cols = 1;
	export let footer = false;
	export let gap: SectionSizing = '';
	export let header = false;
	export let layout: 'boxed' | 'fullwidth' | '' = '';
	export let padding: SectionSizing = '';
	export let size: SectionSizing = '';
	export let subtitle: string = '';
	export let title: string = '';

	$: tag = header ? 'header' : footer ? 'footer' : 'section';
</script>

<svelte:element this={tag} class="section {classes} {size} {layout} {padding ? `padding-${padding}` : ''}">
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
</svelte:element>

<style lang="postcss">
	.section {
		padding: var(--section-padding-y) var(--section-padding-x);

		& header {
			padding: 0 0 var(--section-padding-y);
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

		& footer {
			padding: var(--section-padding-y) 0 0;
		}

		& footer,
		& header {
			display: grid;
			place-items: center stretch;
		}

		&.padding-xs {
			--section-padding-x: var(--space-md);
			--section-padding-y: var(--space-lg);

			@media (--viewport-lg-down) {
				--section-padding-x: var(--space-xl);
				--section-padding-y: var(--space-md);
			}

			@media (--viewport-md-down) {
				--section-padding-x: var(--space-lg);
				--section-padding-y: var(--space-sm);
			}

			@media (--viewport-sm-down) {
				--section-padding-x: var(--space-md);
				--section-padding-y: var(--space-xs);
			}
		}

		&.padding-sm {
			--section-padding-x: var(--space-xl);
			--section-padding-y: var(--space-xl);

			@media (--viewport-lg-down) {
				--section-padding-x: var(--space-xl);
				--section-padding-y: var(--space-lg);
			}

			@media (--viewport-md-down) {
				--section-padding-x: var(--space-lg);
				--section-padding-y: var(--space-md);
			}

			@media (--viewport-sm-down) {
				--section-padding-x: var(--space-md);
				--section-padding-y: var(--space-sm);
			}
		}

		&.padding-md {
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
		&.padding-lg {
			--section-padding-x: var(--space-xl);
			--section-padding-y: var(--space-10xl);

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

		&.padding-xl {
			--section-padding-x: var(--space-xl);
			--section-padding-y: var(--space-12xl);

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
	}

	.boxed > :global(*) {
		max-width: var(--container-max-width);
		margin: auto;
	}
</style>
