<!--
@component
Use in conjunction with ChartHudRow to display chart HUD (heads-up-display) data.
- `direction` determines up/down color
- include `value` prop or default slot when custom formatting is required

#### Usage:
```tsx
  <ChartHudMetric label="Value" value={someValue} direction={1 | 0 | -1} />
```
-->
<script lang="ts">
	export let label: string = '';
	export let value: number | string = '';

	export let direction: number = 0;
</script>

<div class="chart-hud-metric">
	{#if label}
		<dt>{label}</dt>
	{/if}
	<dd class:bullish={direction > 0} class:bearish={direction < 0}>
		<slot>{value}</slot>
	</dd>
</div>

<style lang="postcss">
	.chart-hud-metric {
		display: flex;
		gap: var(--space-xxs);
		align-items: center;
		margin: 0;

		& dt {
			color: hsla(var(--hsl-text-light));
		}
	}
</style>
