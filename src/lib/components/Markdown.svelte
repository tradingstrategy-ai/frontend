<script lang="ts">
	import { micromark } from 'micromark';

	export let content: string;
</script>

<div class="markdown ds-3">
	{@html micromark(content)}
</div>

<style lang="postcss">
	.markdown {
		:global(h1) {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--ls-heading-md, normal);
			margin-block: 1.5rem 0.5rem;
		}

		:global(h2) {
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--ls-heading-sm, normal);
			margin-block: 1.25rem 0.375rem;
		}

		:global(h3) {
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--ls-heading-xs, normal);
			margin-block: 1rem 0.25rem;
		}

		:global(:is(p, li)) {
			font: var(--f-paragraph-lg-roman) !important;
			letter-spacing: var(--ls-paragraph-lg, normal) !important;

			@media (--viewport-xs) {
				font: var(--f-paragraph-md-roman) !important;
				letter-spacing: var(--ls-paragraph-md, normal) !important;
			}
		}

		:global(:is(p, ol, ul)) {
			margin-bottom: 1rem;
		}

		:global(a) {
			text-decoration: underline;
			font-weight: 500;
		}
	}
</style>
