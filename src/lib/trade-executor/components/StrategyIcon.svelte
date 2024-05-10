<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';

	export let strategy: StrategyRuntimeState;
	const dataUrl = strategy.connected ? `/avatars/${strategy.id}.webp` : strategy.icon_url;
</script>

<object type="image/webp" data={dataUrl} aria-label="Strategy icon">
	<img src={strategy.icon_url} alt="Strategy icon" />
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
