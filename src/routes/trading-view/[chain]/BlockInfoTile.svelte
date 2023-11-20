<script lang="ts">
	import { formatAmount } from '$lib/helpers/formatters';
	import { formatDistanceToNowStrict } from 'date-fns';

	export let title: string;
	export let count: number;
	export let timestamp: string | undefined;
</script>

<div class="block-info-tile tile a">
	{#if timestamp}
		<time datetime={timestamp}>
			{formatDistanceToNowStrict(Date.parse(`${timestamp}Z`), { addSuffix: true })}
		</time>
	{/if}
	<h3>{formatAmount(count)}</h3>
	<div class="title">{title}</div>
</div>

<style lang="postcss">
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

	time {
		margin-bottom: var(--space-sm);
		font: var(--f-ui-large-medium);
		color: hsl(var(--hsl-text-light));

		@media (--viewport-md-down) {
			margin-bottom: var(--space-xxs);
			font: var(--f-ui-body-medium);
			letter-spacing: 0.01em;
			color: hsl(var(--hsl-text));
		}
	}

	h3 {
		font: var(--f-h3-bold);
		margin-bottom: var(--space-xxs);

		@media (--viewport-md-down) {
			font: var(--f-h4-bold);
			color: hsl(var(--hsl-text-light));
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
