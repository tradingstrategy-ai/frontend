<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { OptionGroup } from '$lib/helpers/option-group.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	type Props = {
		timeSpans: OptionGroup;
		title?: Snippet | string;
		children: Snippet;
	};

	let { timeSpans, title, children }: Props = $props();
</script>

<div class="chart-container" data-css-props>
	<header>
		{#if typeof title === 'string'}
			<h2>{title}</h2>
		{:else}
			<div>{@render title?.()}</div>
		{/if}
		<SegmentedControl secondary options={timeSpans.options} bind:selected={timeSpans.selected} />
	</header>

	{@render children()}
</div>

<style>
	[data-css-props] {
		--chart-container-padding: 1.5rem;

		@media (--viewport-md-down) {
			--chart-container-padding: 1rem;
		}
	}

	.chart-container {
		:global([data-css-props]) {
			@media (--viewport-xs) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

		display: grid;
		gap: var(--space-sm);
		background: var(--c-box-1);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		padding-block: var(--chart-container-padding);

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: var(--space-sm);
			padding-inline: var(--chart-container-padding);

			h2 {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}
		}
	}
</style>
