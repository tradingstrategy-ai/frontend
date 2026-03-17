<script lang="ts">
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		class?: string;
		children: Snippet;
	}

	let { title, class: classes = '', children }: Props = $props();
</script>

<div class={['market-share-widget-shell', classes]}>
	<MetricsBox {title} class="market-share-widget">
		<div class="market-share-widget-stage">
			{@render children()}
		</div>
	</MetricsBox>
</div>

<style>
	.market-share-widget-shell {
		position: relative;
		display: grid;
		height: 100%;
		isolation: isolate;
	}

	.market-share-widget-shell::before,
	.market-share-widget-shell::after {
		content: '';
		position: absolute;
		pointer-events: none;
		border-radius: clamp(1.4rem, 2vw, 1.8rem);
	}

	.market-share-widget-shell::before {
		inset: 0.9rem 0.85rem 0.15rem;
		z-index: -2;
		background:
			radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--c-info), transparent 76%), transparent 52%),
			radial-gradient(circle at 24% 90%, color-mix(in srgb, var(--c-bullish), transparent 90%), transparent 42%);
		filter: blur(1rem);
		opacity: 0.9;
	}

	.market-share-widget-shell::after {
		inset: 0;
		z-index: -1;
		background: linear-gradient(180deg, color-mix(in srgb, white, transparent 97%), transparent 34%);
		opacity: 0.95;
	}

	.market-share-widget-shell :global(.market-share-widget) {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		height: 100%;
		padding: clamp(1rem, 1.25vw, 1.35rem);
		border: 1px solid color-mix(in srgb, white, transparent 88%);
		border-radius: clamp(1.4rem, 2vw, 1.85rem);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 2%),
				color-mix(in srgb, var(--c-box-1), transparent 16%)
			),
			radial-gradient(circle at 84% 12%, color-mix(in srgb, var(--c-info), transparent 84%), transparent 40%),
			radial-gradient(circle at 20% 100%, color-mix(in srgb, var(--c-bullish), transparent 92%), transparent 36%),
			linear-gradient(132deg, color-mix(in srgb, white, transparent 95%), transparent 38%),
			color-mix(in srgb, var(--c-box-1), transparent 6%);
		box-shadow:
			0 1.4rem 3.25rem color-mix(in srgb, var(--c-text-inverted), transparent 80%),
			inset 0 1px 0 color-mix(in srgb, white, transparent 78%);
		backdrop-filter: blur(1rem) saturate(1.18);
		-webkit-backdrop-filter: blur(1rem) saturate(1.18);
	}

	.market-share-widget-shell :global(.market-share-widget)::before,
	.market-share-widget-shell :global(.market-share-widget)::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
	}

	.market-share-widget-shell :global(.market-share-widget)::before {
		background:
			linear-gradient(180deg, color-mix(in srgb, white, transparent 82%) 0%, transparent 22%),
			linear-gradient(118deg, transparent 34%, color-mix(in srgb, white, transparent 92%) 50%, transparent 66%);
		opacity: 0.9;
	}

	.market-share-widget-shell :global(.market-share-widget)::after {
		inset: auto 0 0;
		height: 38%;
		background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--c-text-inverted), transparent 90%));
		opacity: 0.8;
	}

	.market-share-widget-shell :global(.market-share-widget h2) {
		position: relative;
		margin-bottom: 0.95rem;
		padding-bottom: 0.85rem;
		font-size: 0.82rem;
		letter-spacing: 0.16em;
		color: color-mix(in srgb, var(--c-text-light), white 18%);
		text-shadow: 0 1px 0 color-mix(in srgb, white, transparent 72%);
	}

	.market-share-widget-shell :global(.market-share-widget h2)::after {
		content: '';
		position: absolute;
		right: 0;
		bottom: -1px;
		width: 34%;
		max-width: 7.5rem;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--c-info), white 22%) 36%,
			color-mix(in srgb, white, transparent 84%)
		);
	}

	.market-share-widget-stage {
		position: relative;
		display: grid;
		min-height: 100%;
	}
</style>
