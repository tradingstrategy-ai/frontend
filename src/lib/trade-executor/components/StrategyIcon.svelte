<script lang="ts">
	import type { StrategyInfo } from 'trade-executor/models/strategy-info';

	export let strategy: StrategyInfo;

	const localWebpIconUrl = `/avatars/${strategy.id}.webp`;
	const localSvgIconUrl = `/avatars/${strategy.id}.svg`;
	const strategyIconUrl = strategy.icon_url?.replace(/^http:/, 'https:');
	const outdated = Boolean(strategy.newVersionId);
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
			<img src={localSvgIconUrl} alt="Strategy icon" loading="lazy" decoding="async" />
		</picture>
	{:else}
		<img src={strategyIconUrl} alt="Strategy icon" loading="lazy" decoding="async" />
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
