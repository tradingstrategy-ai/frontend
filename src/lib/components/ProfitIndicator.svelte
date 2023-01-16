<script lang="ts">
	export let bearish = false;
	export let bullish = false;
</script>

<span class="profit-indicator" class:bearish class:bullish>
	<slot />
</span>

<style lang="postcss">
	.bullish {
		&,
		& > :global(*) {
			color: hsla(var(--hsl-bullish));
		}
	}

	.bearish {
		&,
		& > :global(*) {
			color: hsla(var(--hsl-bearish));
		}
	}
</style>
