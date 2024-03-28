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
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--ls-heading-lg, normal);
			margin-block: 2rem 1rem;

			@media (--viewport-sm-down) {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--ls-heading-md, normal);
			}
		}

		:global(h2) {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--ls-heading-md, normal);
			margin-block: 1.5rem 0.75rem;

			@media (--viewport-sm-down) {
				font: var(--f-heading-sm-medium);
				letter-spacing: var(--ls-heading-sm, normal);
			}
		}

		:global(h3) {
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--ls-heading-sm, normal);
			margin-block: 1.25rem 0.5rem;

			@media (--viewport-sm-down) {
				font: var(--f-heading-xs-medium);
				letter-spacing: var(--ls-heading-xs, normal);
			}
		}

		:global(:is(p, li)) {
			font: var(--f-paragraph-lg-roman);
			letter-spacing: var(--ls-paragraph-lg, normal);

			@media (--viewport-sm-down) {
				font: var(--f-paragraph-md-roman);
				letter-spacing: var(--ls-paragraph-md, normal);
			}
		}

		:global(:is(p, ol, ul)) {
			margin-bottom: 1em;
		}

		:global(a) {
			text-decoration: underline;
			font-weight: 500;
		}

		:global(:first-child) {
			margin-top: 0;
		}

		:global(:last-child) {
			margin-bottom: 0;
		}
	}
</style>
