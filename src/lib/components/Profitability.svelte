<!--
@component
Display profit/loss or price change value, formatted as percent, with color class
and ▼ ◼︎ ▲ direction markers.

The `boxed` prop displays the value with padding and a background color.

The module also exports a `getProfitInfo` utility function for scenarios where
using the component isn't practical.

@example

```svelte
	<Profitability of={profitValue} />

	<Profitability of={profitValue} boxed>
		{someOtherValue} with profit/loss color coding
	</Profitability>

	<Profitability of={profitValue}>
		{#snippet children(profitInfo, getLabel)}
			{profitInfo}
			<span class="custom-label">
				{getLabel('down', 'neutral', 'up')}
			</span>
		{/snippet}
	</Profitability>
```
-->
<script module lang="ts">
	import { toFloatingPoint, isNumber, notFilledMarker } from '$lib/helpers/formatters';

	export type ProfitInfo = ReturnType<typeof getProfitInfo>;

	/**
	 * Get information used to display profit/loss or price change values.
	 *
	 * This encapsulates the core display logic of the Profitability component as
	 * a utility function for scenarios where using the component isn't practical.
	 *
	 * The returned object provides a `getLabel` method, which accepts a tuple of
	 * of ('down', 'neutral', 'up') labels and returns the appropriate option.
	 *
	 * The object also includes a `toString` method, enabling it to be used
	 * directly in template or string interpolation contexts.
	 *
	 * @param n decimal representation profit or price change value
	 */
	export function getProfitInfo(n: MaybeNumberlike) {
		const value = toFloatingPoint(n);
		const formatted = formatProfitability(value);
		const direction = getDirection(value, formatted);

		const getLabel = (...labels: string[]) => labels[direction + 1];
		const marker = getLabel('▼', '◼︎', '▲');
		const directionClass = getLabel('bearish', 'neutral', 'bullish');

		const toString = () => (value === undefined ? notFilledMarker : `${marker} ${formatted}`);

		return { value, formatted, direction, marker, directionClass, getLabel, toString };
	}

	function formatProfitability(value: number | undefined) {
		if (!isNumber(value)) return;

		return value.toLocaleString('en-us', {
			minimumFractionDigits: 1,
			maximumFractionDigits: Math.abs(value) < 0.001 ? 2 : 1,
			style: 'percent',
			signDisplay: 'never'
		});
	}

	function getDirection(value: number | undefined, formatted: string | undefined) {
		if (!value || formatted === '0.0%') return 0;
		return Math.sign(value);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		of: MaybeNumberlike;
		boxed?: boolean;
		class?: string;
		children?: Snippet<[ProfitInfo, ProfitInfo['getLabel']]>;
	};

	let { of, boxed = false, class: classes, children }: Props = $props();

	let profitInfo = $derived(getProfitInfo(of));
</script>

<span class="profitability {profitInfo.directionClass} {classes}" class:boxed class:default={!children}>
	{#if children}
		{@render children?.(profitInfo, profitInfo.getLabel)}
	{:else}
		{profitInfo}
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

			&.neutral {
				background: var(--c-box-2);
				--background-hover: var(--c-box-4);
			}

			&:is(.bullish, .bearish) {
				background: color-mix(in srgb, transparent, currentColor 12%);
				--background-hover: color-mix(in srgb, transparent, currentColor 24%);
			}
		}
	}
</style>
