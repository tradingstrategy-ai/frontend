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
		status?: 'beta' | 'bullish' | 'bearish' | 'error' | 'success' | 'warning' | 'default';
		children: Snippet<[]>;
	}

	let { class: classes, status = 'default', children }: Props = $props();
</script>

<span class="data-badge {status} {classes}" data-css-props>
	{@render children()}
</span>

<style>
	[data-css-props] {
		--data-badge-background: color-mix(in srgb, var(--c-box-2), transparent 38%);
		--data-badge-color: var(--c-text);
		--data-badge-height: auto;
		--data-badge-tint: var(--c-text-light);
	}

	.data-badge {
		position: relative;
		display: inline-grid;
		align-items: center;
		height: var(--data-badge-height);
		padding: 0.38em 0.56em;
		border-radius: 0.68em;
		overflow: hidden;
		isolation: isolate;
		font-family: var(--ff-ui);
		font-weight: 500;
		line-height: var(--lh-ui, 125%);
		color: var(--data-badge-color);
		border: 1px solid color-mix(in srgb, var(--c-text-light), var(--data-badge-tint) 12%);
		background:
			radial-gradient(circle at 18% 14%, color-mix(in srgb, var(--c-text-light), transparent 40%) 0%, transparent 24%),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-text-light), transparent 94%),
				color-mix(in srgb, var(--data-badge-tint), transparent 97%) 48%,
				color-mix(in srgb, var(--c-text-inverted), transparent 99%) 100%
			),
			linear-gradient(135deg, color-mix(in srgb, var(--c-text-light), transparent 97%), transparent 54%),
			var(--data-badge-background);
		box-shadow:
			0 0.12rem 0.35rem color-mix(in srgb, var(--data-badge-tint), transparent 96%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 72%),
			inset 0 -0.4rem 0.75rem color-mix(in srgb, var(--c-text-inverted), transparent 97%);
		backdrop-filter: blur(0.88rem) saturate(1.12);
		text-transform: capitalize;
		transition: var(--transition-1);

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background:
				linear-gradient(
					115deg,
					transparent 0%,
					color-mix(in srgb, var(--c-text-light), transparent 95%) 18%,
					transparent 42%
				),
				radial-gradient(
					circle at top left,
					color-mix(in srgb, var(--c-text-light), transparent 98%) 0%,
					transparent 30%
				);
			opacity: 0.16;
			pointer-events: none;
			mix-blend-mode: screen;
		}

		&::after {
			content: '';
			position: absolute;
			inset: 1px;
			border-radius: inherit;
			border: 1px solid color-mix(in srgb, var(--c-text-light), transparent 97%);
			opacity: 0.2;
			pointer-events: none;
		}

		&.bullish {
			color: var(--c-bullish);
			--data-badge-tint: var(--c-bullish);
			--data-badge-background: color-mix(in srgb, var(--c-bullish), transparent 95%);
		}

		&.bearish {
			color: var(--c-bearish);
			--data-badge-tint: var(--c-bearish);
			--data-badge-background: color-mix(in srgb, var(--c-bearish), transparent 95%);
		}

		&.error {
			color: color-mix(in srgb, var(--c-text), var(--c-error) 25%);
			--data-badge-tint: var(--c-error);
			--data-badge-background: color-mix(in srgb, var(--c-error), transparent 95%);
		}

		&.success {
			color: color-mix(in srgb, var(--c-text), var(--c-success) 25%);
			--data-badge-tint: var(--c-success);
			--data-badge-background: color-mix(in srgb, var(--c-success), transparent 95%);
		}

		&.beta {
			color: color-mix(in srgb, var(--c-text), var(--c-success) 25%);
			--data-badge-tint: var(--c-success);
			--data-badge-background: color-mix(in srgb, var(--c-success), transparent 94%);
		}

		&.warning {
			color: color-mix(in srgb, var(--c-text), var(--c-warning) 25%);
			--data-badge-tint: var(--c-warning);
			--data-badge-background: color-mix(in srgb, var(--c-warning), transparent 95%);
		}
	}
</style>
