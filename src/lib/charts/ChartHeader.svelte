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
		margin-bottom: 1em;

		@media (--viewport-sm-down) {
			display: grid;
		}

		h2 {
			flex: 1;
			font: var(--f-h2-medium);
			white-space: nowrap;
		}
	}
</style>
