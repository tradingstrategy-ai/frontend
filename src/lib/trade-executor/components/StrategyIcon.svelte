<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';

	export let strategy: StrategyRuntimeState;

	const localIconUrl = `/avatars/${strategy.id}.webp`;
	const strategyIconUrl = strategy.icon_url?.replace(/^http:/, 'https:');
	const dataUrl = strategy.connected ? localIconUrl : strategyIconUrl;
</script>

<object type="image/webp" data={dataUrl} aria-label="Strategy icon">
	<img src={strategyIconUrl} alt="Strategy icon" />
</object>

<style lang="postcss">
	:is(img, object) {
		display: grid;
		place-items: center;
		height: inherit;
		width: inherit;
		border-radius: 100%;
		overflow: hidden;
		object-fit: cover;
	}
</style>
