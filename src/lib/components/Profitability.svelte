<script lang="ts">
	import type { Snippet } from 'svelte';
	import { toFloatingPoint, isNumber, notFilledMarker } from '$lib/helpers/formatters';

	type Props = {
		of: MaybeNumberlike;
		boxed?: boolean;
		class?: string;
		children?: Snippet;
		content?: Snippet<[{ formatted: string | undefined; direction: number; marker: string }]>;
	};

	let { of, boxed = false, class: classes, children, content }: Props = $props();

	let value = $derived(toFloatingPoint(of));

	let formatted = $derived.by(() => {
		if (!isNumber(value)) return;

		const absValue = Math.abs(value);

		return absValue.toLocaleString('en-us', {
			minimumFractionDigits: 1,
			maximumFractionDigits: absValue < 0.001 ? 2 : 1,
			style: 'percent'
		});
	});

	let direction = $derived.by(() => {
		if (!value || formatted === '0.0%') return 0;
		return Math.sign(value);
	});

	let marker = $derived(direction === 0 ? '◼︎' : direction > 0 ? '▲' : '▼');

	let directionClass = $derived(direction === 0 ? 'neutral' : direction > 0 ? 'bullish' : 'bearish');
</script>

<span class="profitability {directionClass} {classes}" class:boxed class:default={!content}>
	{#if children || content}
		{@render children?.()}
		{@render content?.({ formatted, direction, marker })}
	{:else if value === undefined}
		{notFilledMarker}
	{:else}
		{marker}
		{formatted}
	{/if}
</span>

<style>
	.profitability {
		&.default {
			white-space: nowrap;
		}

		&.boxed {
			border-radius: var(--radius-sm);
			padding: 0.5em 0.75em;
			background: var(--c-box-2);

			&:is(.bullish, .bearish) {
				background: color-mix(in srgb, transparent, currentColor 12%);
				--background-hover: color-mix(in srgb, transparent, currentColor 24%);

				&:hover {
					background: var(--background-hover);
				}
			}
		}
	}
</style>
