<script lang="ts">
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { formatAmount } from '$lib/helpers/formatters';

	interface Props {
		title: string;
		count: number;
		timestamp?: string;
	}

	let { title, count, timestamp }: Props = $props();
</script>

<div class="block-info-tile tile a">
	{#if timestamp}
		<Timestamp class="block-ts" date={timestamp} relative />
	{/if}
	<h3>{formatAmount(count)}</h3>
	<div class="title">{title}</div>
</div>

<style>
	.block-info-tile {
		display: grid;
		align-content: center;
		justify-items: center;
		padding: calc(var(--container-width) * 0.15);

		@media (--viewport-md-down) {
			padding: var(--space-ls);
			align-content: end;
			justify-items: start;
		}
	}

	:global(.block-ts) {
		margin-bottom: var(--space-sm);
		font: var(--f-ui-large-medium);
		color: var(--c-text-light);

		@media (--viewport-md-down) {
			margin-bottom: var(--space-xxs);
			font: var(--f-ui-body-medium);
			letter-spacing: 0.01em;
			color: var(--c-text);
		}
	}

	h3 {
		font: var(--f-h3-bold);
		margin-bottom: var(--space-xxs);

		@media (--viewport-md-down) {
			font: var(--f-h4-bold);
			color: var(--c-text-light);
		}
	}

	.title {
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		@media (--viewport-md-down) {
			font: var(--f-ui-small-medium);
		}
	}
</style>
