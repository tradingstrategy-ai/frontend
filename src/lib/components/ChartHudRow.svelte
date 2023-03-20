<!--
@component
Use in conjunction with ChartHudMetric to display chart HUD (heads-up-display) data.

#### Usage:
```tsx
  <ChartHudRow>
    <ChartHudMetric ... />
  </ChartHudRow>
```
-->
<script lang="ts">
	export let align: 'left' | 'right' = 'left';
</script>

<dl class="chart-hud-row {align}">
	<slot />
</dl>

<style lang="postcss">
	.chart-hud-row {
		display: flex;
		gap: var(--space-ss);
		font: var(--chart-hud-font, var(--f-ui-xs-roman));
		letter-spacing: var(--chart-hud-letter-spacing, var(--f-ui-xs-spacing, normal));
		padding-block: var(--space-xxxs);
		white-space: nowrap;

		&:first-of-type {
			margin-top: var(--space-xxs);
		}
	}

	.right {
		justify-content: flex-end;
	}
</style>
