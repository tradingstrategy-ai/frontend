<script lang="ts">
	import { formatAmount } from '$lib/helpers/formatters';
	import { Button } from '$lib/components';

	export let count: number;
	export let title: string;
	export let description: string;
	export let buttonLabel: string;
	export let href: string;
	export let rel: string | undefined = undefined;
</script>

<a class="summary-data-tile tile a" {href} {rel}>
	<div>
		<h3>{formatAmount(count)}</h3>
		<h4>{title}</h4>
		<p>{description}</p>
	</div>
	<Button secondary label={buttonLabel} />
</a>

<style lang="postcss">
	.summary-data-tile {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: var(--space-lg);
		padding: calc(var(--container-width) * 0.15);

		@media (--viewport-md-down) {
			padding: var(--space-ls);
		}

		h3 {
			font: var(--f-h2-bold);

			@media (--viewport-md-down) {
				font: var(--f-h3-bold);
			}
		}

		h4 {
			margin-block: var(--space-xxs) var(--space-sm);
			font: var(--f-h4-medium);

			@media (--viewport-md-down) {
				margin-block: 0;
				font: var(--f-h5-medium);
				color: hsl(var(--hsl-text-light));
			}
		}

		p {
			font: var(--f-ui-small-roman);
			letter-spacing: 0.01em;

			@media (--viewport-md-down) {
				display: none;
			}
		}
	}
</style>
