<script lang="ts">
	import { formatAmount } from '$lib/helpers/formatters';
	import { Button } from '$lib/components';

	export let count: number;
	export let title: string;
	export let description: string;
	export let buttonLabel: string;
	export let href: string;
</script>

<div class="tile">
	<div>
		<h3>{formatAmount(count)}</h3>
		<h4>{title}</h4>
		<p>{description}</p>
	</div>
	<Button secondary label={buttonLabel} {href} />
</div>

<style lang="postcss">
	.tile {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 1.5rem;
		border-radius: 0.5rem;
		background: var(--c-background-1-v1);
		padding: calc(var(--container-width) * 0.15);

		@media (--viewport-md-down) {
			padding: 1.25rem;
		}

		& h3 {
			font: var(--f-h2-bold);

			@media (--viewport-md-down) {
				font: var(--f-h3-bold);
			}
		}

		& h4 {
			margin-block: 0.25rem 0.625rem;

			@media (--viewport-md-down) {
				margin-block: 0;
				font: var(--f-h5-medium);
				color: var(--c-text-2-v1);
			}
		}

		& p {
			font: var(--f-ui-small-roman);
			letter-spacing: 0.01em;

			@media (--viewport-md-down) {
				display: none;
			}
		}

		/* override secondary button hover/focus color (default matches tile background) */
		& :global .secondary {
			&:hover,
			&:focus {
				background: var(--cm-light, var(--c-parchment-extra-dark)) var(--cm-dark, var(--c-gray-extra-dark));
			}
		}
	}
</style>
