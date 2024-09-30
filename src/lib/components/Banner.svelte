<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Section } from '$lib/components';

	export let title: string;
	export let padding: ComponentProps<Section>['padding'];
	export let gap: ComponentProps<Section>['gap'];
</script>

<div class="banner">
	<Section {padding} {gap} maxWidth="sm">
		<h2>{title}</h2>
		<div class="content">
			<slot />
		</div>
		{#if $$slots.cta}
			<footer>
				<slot name="cta" />
			</footer>
		{/if}
	</Section>
</div>

<style>
	.banner {
		display: contents;
		--section-background: var(--c-background-accent-1);

		:is(h2, footer) {
			text-align: center;
		}

		:is(h2, footer, .content) {
			padding-inline: var(--space-md);
		}

		@media (--viewport-sm-down) {
			h2 {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}
		}

		@media (--viewport-md-up) {
			.content :global(:where(p, li)) {
				font: var(--f-ui-xl-roman);
				letter-spacing: var(--f-ui-xl-spacing, normal);
				margin-bottom: var(--space-lg);
			}
		}
	}
</style>
