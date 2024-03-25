<script lang="ts">
	import { micromark } from 'micromark';
	import { SummaryBox } from '$lib/components';

	export let data;
	const longDescription = data.strategy.long_description;
</script>

<div class="strategy-details">
	<SummaryBox title="Strategy details">
		{#if longDescription}
			<div class="markdown">
				{@html micromark(longDescription)}
			</div>
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

	.markdown {
		font: var(--f-paragraph-lg-roman);
		letter-spacing: var(--ls-paragraph-lg, normal);
		overflow: hidden;
		overflow-wrap: break-word;

		:global(h1) {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--ls-heading-md, normal);
			margin-block: 1.5rem 0.5rem;
		}

		:global(:is(p, ol, ul)) {
			margin-bottom: 1rem;
		}

		/* :global(p + p) {
				margin-block: 1rem;
			} */

		:global(a) {
			/* text-decoration: underline; */
			border-bottom: 1px solid currentColor;
			font-weight: 500;
		}

		@media (--viewport-xs) {
			font: var(--f-paragraph-md-roman);
			letter-spacing: var(--ls-paragraph-md, normal);
		}
	}
</style>
