<!--
@component
Display an inline data badge, with an optional status (which determines the badge color).
The font size is inherited, and the padding and radius are relative to the font size.
The color and background color may be overridden with CSS props.

@example

```svelte
<DataBadge status="error">Failed!</DataBadge>
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		status?: 'bullish' | 'bearish' | 'error' | 'success' | 'warning' | 'default';
		children: Snippet<[]>;
	}

	let { class: classes, status = 'default', children }: Props = $props();
</script>

<span class="data-badge {status} {classes}" data-css-props>
	{@render children()}
</span>

<style>
	[data-css-props] {
		--data-badge-background: var(--c-box-2);
		--data-badge-color: var(--c-text);
		--data-badge-height: auto;
	}

	.data-badge {
		display: inline-grid;
		align-items: center;
		height: var(--data-badge-height);
		padding: 0.5em 0.625em;
		border-radius: 0.75em;
		font-family: var(--ff-ui);
		font-weight: 500;
		line-height: var(--lh-ui, 125%);
		color: var(--data-badge-color);
		background: var(--data-badge-background);
		text-transform: capitalize;
		transition: var(--transition-1);

		&.bullish {
			color: var(--c-bullish);
			background: color-mix(in srgb, currentColor, transparent 75%);
		}

		&.bearish {
			color: var(--c-bearish);
			background: color-mix(in srgb, currentColor, transparent 75%);
		}

		&.error {
			color: color-mix(in srgb, var(--c-text), var(--c-error) 25%);
			background: color-mix(in srgb, transparent, var(--c-error) 35%);
		}

		&.success {
			color: color-mix(in srgb, var(--c-text), var(--c-success) 25%);
			background: color-mix(in srgb, transparent, var(--c-success) 35%);
		}

		&.warning {
			color: color-mix(in srgb, var(--c-text), var(--c-warning) 25%);
			background: color-mix(in srgb, transparent, var(--c-warning) 40%);
		}
	}
</style>
