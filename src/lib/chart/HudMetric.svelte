<!--
@component
Use in conjunction with HudRow to display chart HUD (heads-up-display) data.
- `direction` determines up/down color
- include `value` prop or default slot when custom formatting is required

@example

```svelte
  <HudMetric label="Value" value={someValue} direction={1 | 0 | -1} />
```
-->
<script lang="ts">
	let className: string = '';
	export { className as class };
	export let label: string = '';
	export let value: number | string = '';
	export let direction: number = 0;
</script>

<div class="hud-metric {className}">
	{#if label}
		<dt>{label}</dt>
	{/if}
	<dd class:bullish={direction > 0} class:bearish={direction < 0}>
		<slot>{value}</slot>
	</dd>
</div>

<style>
	.hud-metric {
		display: flex;
		gap: var(--space-xxs);
		align-items: center;
		margin: 0;

		dt {
			color: var(--c-text-light);
		}
	}
</style>
