<!--
@component
Display an inline data badge, with an optional status (which determines the badge color).
The font size is inherited, and the padding and radius are relative to the font size.
The color and background color may be overridden with CSS props.

#### Usage:
```tsx
<DataBadge status="error">Failed!</DataBadge>
```
-->
<script lang="ts">
	export let status: 'bullish' | 'bearish' | 'error' | 'success' | 'warning' | 'default' = 'default';
</script>

<span class="data-badge {status}" data-css-props>
	<slot />
</span>

<style lang="postcss">
	[data-css-props] {
		--data-badge-background: hsl(var(--hsla-box-2));
		--data-badge-color: hsl(var(--hsl-text));
		--data-badge-height: auto;
	}

	.data-badge {
		display: inline-grid;
		align-items: center;
		height: var(--data-badge-height);
		padding: 0.5em 0.625em;
		border-radius: 0.75em;
		font-weight: 500;
		color: var(--data-badge-color);
		background: var(--data-badge-background);
		text-transform: capitalize;
		transition: var(--transition-1);

		&.bullish {
			color: hsl(var(--hsl-bullish));
			background: hsl(var(--hsl-bullish) / 25%);
		}

		&.bearish {
			color: hsl(var(--hsl-bearish));
			background: hsl(var(--hsl-bearish) / 25%);
		}

		&.error {
			color: color-mix(in srgb, hsl(var(--hsl-text)), hsl(var(--hsl-error)) 25%);
			background: hsl(var(--hsl-error) / 35%);
		}

		&.success {
			color: color-mix(in srgb, hsl(var(--hsl-text)), hsl(var(--hsl-success)) 25%);
			background: hsl(var(--hsl-success) / 35%);
		}

		&.warning {
			color: color-mix(in srgb, hsl(var(--hsl-text)), hsl(var(--hsl-warning)) 25%);
			background: hsl(var(--hsl-warning) / 40%);
		}
	}
</style>
