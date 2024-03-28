<script lang="ts">
	import { Markdown } from '$lib/components';

	export let data;
	const content = data.strategy.long_description;
</script>

<div class="strategy-description">
	{#if content}
		<Markdown {content} />
	{:else}
		No details available.
	{/if}
</div>

<style lang="postcss">
	.strategy-description {
		background: var(--c-box-1);
		border-radius: var(--radius-md);
		padding: 1.5rem;

		@media (--viewport-sm-down) {
			padding: 1rem;
		}
	}
</style>
