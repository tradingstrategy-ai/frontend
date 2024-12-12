<script lang="ts">
	import type { ChartCursor } from './ChartIQ.svelte';
	import Marker from './Marker.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';

	type Props = {
		cursor: ChartCursor;
		withTime?: boolean;
		formatValue: Formatter<MaybeNumber>;
	};

	let { cursor, withTime, formatValue }: Props = $props();

	let { position, data } = $derived(cursor);

	let direction = $derived(Math.sign(data?.Close - data?.iqPrevClose || 0));
	let directionClass = $derived(direction === 0 ? 'neutral' : direction > 0 ? 'bullish' : 'bearish');
</script>

{#if data}
	<Marker x={position.DateX} y={position.CloseY} size={4.5} />

	<div class="chart-tooltip" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
		<div class="content {directionClass}">
			<div class="timestamp">
				<Timestamp date={data.adjustedDate} {withTime} />
			</div>
			<div class="value">
				{formatValue(data.Close, 2)}
			</div>
		</div>
	</div>
{/if}

<style>
	.chart-tooltip {
		position: absolute;
		left: var(--x);
		top: var(--y);
		transform: translate(-50%, calc(-100% - var(--space-md)));

		/* opaque (no transparency) variant of chart container background color */
		--background-opaque: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-1-alpha));
		/* semi-opaque base background color (allows chart lines to partially bleed through) */
		--background-base: color-mix(in srgb, transparent, var(--background-opaque) 75%);

		.content {
			display: grid;
			gap: 0.25rem;
			border-radius: var(--radius-sm);
			padding: 0.5rem 0.75rem;
			text-align: right;

			&.neutral {
				color: var(--c-text);
				background: color-mix(in srgb, var(--background-base), var(--c-box-4));
			}

			&:is(.bullish, .bearish) {
				background: color-mix(in srgb, var(--background-base), currentColor 15%);
			}
		}

		.timestamp {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing);
			color: var(--c-text-extra-light);
		}

		.value {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing);
		}
	}
</style>
