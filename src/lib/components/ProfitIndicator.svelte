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
			color: var(--c-bullish);
		}
	}

	.bearish {
		&,
		& > :global(*) {
			color: var(--c-bearish);
		}
	}
</style>
