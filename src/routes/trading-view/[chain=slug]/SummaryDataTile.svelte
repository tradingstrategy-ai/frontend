<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import { formatAmount } from '$lib/helpers/formatters';

	interface Props {
		count: number | undefined;
		title: string;
		buttonLabel: string;
		href: string;
		rel?: string;
		children: Snippet;
	}

	let { count, title, buttonLabel, href, rel, children }: Props = $props();

	let disabled = $derived(count === undefined);
</script>

<div class={['summary-data-tile', 'tile a', 'targetable', disabled && 'disabled']}>
	{#if !disabled}
		<TargetableLink {href} {rel} label="View details" />
	{/if}
	<div>
		<h3>{formatAmount(count)}</h3>
		<h4>{title}</h4>
		<p>{@render children()}</p>
	</div>
	<Button secondary {disabled} label={buttonLabel} />
</div>

<style>
	.summary-data-tile {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: var(--space-lg);
		padding: calc(var(--container-width) * 0.15);

		@media (--viewport-md-down) {
			padding: var(--space-ls);
		}

		&.disabled {
			cursor: not-allowed;
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
				color: var(--c-text-light);
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
