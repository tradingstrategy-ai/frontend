<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		class?: string;
		children: Snippet;
	}

	let { title, class: classes, children }: Props = $props();
</script>

<div class={['metrics-box', classes]}>
	{#if title}
		<h2>{title}</h2>
	{/if}
	{@render children()}
</div>

<style>
	.metrics-box {
		display: grid;
		grid-template-rows: auto 1fr;
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		padding: var(--padding, 1.25rem);
		background: var(--c-box-1);

		h2 {
			margin-bottom: 1rem;
			font: var(--f-heading-xs-medium);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-light);

			@media (--viewport-sm-down) {
				font-size: 0.875rem;
			}
		}
	}
</style>
