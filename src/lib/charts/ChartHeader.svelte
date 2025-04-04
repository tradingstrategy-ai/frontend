<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		children?: Snippet;
	};

	let { title, children }: Props = $props();
</script>

<div class="chart-header">
	<h2>{title}</h2>
	{@render children?.()}
</div>

<style>
	.chart-header {
		:global([data-css-props]) {
			@media (--viewport-xs) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.5rem;
		border-bottom: 1px solid var(--cm-light, var(--c-text-light)) var(--cm-dark, var(--c-text-extra-light));
		padding-bottom: 1rem;

		@media (--viewport-sm-down) {
			display: grid;
		}

		h2 {
			margin: 0;
			flex: 1;
			font: var(--f-heading-lg-medium);
			letter-spacing: 0.06em;
			text-transform: uppercase;
			white-space: nowrap;

			@media (--viewport-sm-down) {
				font: var(--f-heading-md-medium);
			}
		}
	}
</style>
