<!--
@component
Round strategy avatar. Connected strategies use the bundled `/avatars/<id>` image (webp with
an SVG fallback); others use the icon URL from the strategy metadata. The rendered size comes
from the parent (`height`/`width: inherit`); the intrinsic `width`/`height` only fix the
aspect ratio so the image reserves its box before it loads.

@example

```svelte
	<StrategyIcon {strategy} />
```
-->
<script lang="ts">
	import type { StrategyInfo } from 'trade-executor/models/strategy-info';

	interface Props {
		strategy: StrategyInfo;
	}

	let { strategy }: Props = $props();

	let localWebpIconUrl = $derived(`/avatars/${strategy.id}.webp`);
	let localSvgIconUrl = $derived(`/avatars/${strategy.id}.svg`);
	let strategyIconUrl = $derived(strategy.icon_url?.replace(/^http:/, 'https:'));
	let outdated = $derived(Boolean(strategy.newVersionId));
</script>

<div class="strategy-icon" class:outdated>
	{#if outdated}
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<text x="50" y="50">outdated</text>
		</svg>
	{:else if strategy.connected}
		<picture>
			<source srcset={localWebpIconUrl} type="image/webp" />
			<source srcset={localSvgIconUrl} type="image/svg+xml" />
			<img src={localSvgIconUrl} alt="Strategy icon" width="128" height="128" loading="lazy" decoding="async" />
		</picture>
	{:else}
		<img src={strategyIconUrl} alt="Strategy icon" width="128" height="128" loading="lazy" decoding="async" />
	{/if}
</div>

<style>
	.strategy-icon {
		:is(&, img, picture) {
			display: grid;
			place-items: center;
			height: inherit;
			width: inherit;
			border-radius: 100%;
			overflow: hidden;
			object-fit: cover;
		}

		&.outdated {
			background: hsl(100 0% 50% / 65%);
		}

		svg {
			z-index: 1;

			text {
				font: var(--f-ui-md-bold);
				fill: #fdfdfc;
				text-anchor: middle;
				alignment-baseline: middle;
				filter: drop-shadow(0 0.375em 0.625em #131211);
			}
		}
	}
</style>
