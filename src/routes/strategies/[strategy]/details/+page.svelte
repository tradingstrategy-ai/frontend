<script lang="ts">
	import { Markdown, SummaryBox } from '$lib/components';

	export let data;
	const content = data.strategy.long_description;
</script>

<div class="strategy-details">
	<SummaryBox title="Strategy details">
		{#if content}
			<Markdown {content} />
		{:else}
			No details available.
		{/if}
	</SummaryBox>
</div>

<style lang="postcss">
	.strategy-details {
		:global(header h3) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--ls-heading-lg, normal);
		}
	}
</style>
