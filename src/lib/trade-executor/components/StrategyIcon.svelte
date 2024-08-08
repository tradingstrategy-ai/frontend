<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';

	export let strategy: StrategyRuntimeState;

	const localIconUrl = `/avatars/${strategy.id}.webp`;
	const strategyIconUrl = strategy.icon_url?.replace(/^http:/, 'https:');
	const dataUrl = strategy.connected ? localIconUrl : strategyIconUrl;
	const outdated = Boolean(strategy.new_version_id);
</script>

<div class="strategy-icon" class:outdated>
	<object type="image/webp" data={dataUrl} aria-label="Strategy icon">
		<img src={strategyIconUrl} alt="Strategy icon" />
	</object>
	{#if outdated}
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<text x="50" y="50">outdated</text>
		</svg>
	{/if}
</div>

<style lang="postcss">
	.strategy-icon {
		:is(&, img, object) {
			display: grid;
			place-items: center;
			height: inherit;
			width: inherit;
			border-radius: 100%;
			overflow: hidden;
			object-fit: cover;
		}

		> * {
			grid-area: 1 / -1;
		}

		&.outdated object {
			opacity: 0.85;
			filter: blur(1.5px);
		}

		svg {
			z-index: 1;

			text {
				font: var(--f-ui-md-bold);
				fill: #fdfdfc;
				stroke: #131211;
				stroke-width: 0.25px;
				text-anchor: middle;
				alignment-baseline: middle;
				filter: drop-shadow(0 0.25em 0.5em #131211);
			}
		}
	}
</style>
