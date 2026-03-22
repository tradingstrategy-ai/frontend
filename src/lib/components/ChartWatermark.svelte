<!--
@component
Decorative Trading Strategy chart watermark rendered behind chart content.

- Uses the full horizontal website logo
- Intended for standalone vault chart surfaces only
- Always non-interactive and hidden from assistive technology

@example

```svelte
	<ChartWatermark corner="top-right" />
```
-->
<script lang="ts">
	import logo from '$lib/assets/logo-horizontal.svg?raw';

	interface Props {
		corner?: 'top-left' | 'top-right';
		inset?: 'default' | 'relaxed';
		opacity?: number;
		class?: string;
	}

	let { corner = 'top-right', inset = 'default', opacity = 0.07, class: className = '' }: Props = $props();
</script>

<div
	class={`chart-watermark ${corner} ${inset} ${className}`.trim()}
	data-testid="chart-watermark"
	aria-hidden="true"
	style={`--chart-watermark-opacity: ${opacity};`}
>
	{@html logo}
</div>

<style>
	.chart-watermark {
		position: absolute;
		top: clamp(0.8rem, 1.8vw, 1.15rem);
		width: clamp(10.5rem, 18vw, 14rem);
		color: color-mix(in srgb, var(--c-text-light), white 24%);
		opacity: var(--chart-watermark-opacity, 0.07);
		pointer-events: none;
		user-select: none;
		z-index: 0;
		filter: saturate(0.92);
	}

	.chart-watermark.top-left {
		left: clamp(0.8rem, 1.8vw, 1.15rem);
	}

	.chart-watermark.top-right {
		right: clamp(0.8rem, 1.8vw, 1.15rem);
	}

	.chart-watermark.relaxed {
		top: clamp(1.35rem, 2.4vw, 1.8rem);
	}

	.chart-watermark.relaxed.top-left {
		left: clamp(1.35rem, 2.4vw, 1.8rem);
	}

	.chart-watermark.relaxed.top-right {
		right: clamp(1.35rem, 2.4vw, 1.8rem);
	}

	.chart-watermark :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.chart-watermark :global(.logotype) {
		fill: currentColor;
	}

	@media (--viewport-sm-down) {
		.chart-watermark {
			top: 0.7rem;
			width: clamp(9rem, 42vw, 11.5rem);
		}

		.chart-watermark.top-left {
			left: 0.7rem;
		}

		.chart-watermark.top-right {
			right: 0.7rem;
		}

		.chart-watermark.relaxed {
			top: 1rem;
		}

		.chart-watermark.relaxed.top-left {
			left: 1rem;
		}

		.chart-watermark.relaxed.top-right {
			right: 1rem;
		}
	}
</style>
