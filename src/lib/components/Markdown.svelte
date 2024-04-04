<script lang="ts">
	import { micromark } from 'micromark';
	import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';

	export let content: string;

	const options = {
		extensions: [gfmTable()],
		htmlExtensions: [gfmTableHtml()]
	};
</script>

<div class="markdown ds-3">
	{@html micromark(content, options)}
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

		:global(:is(p, ol, ul, table)) {
			margin-bottom: 1em;
		}

		:global(a) {
			text-decoration: underline;
			font-weight: 500;
		}

		:global table {
			width: 100%;
			border-collapse: collapse;
			border-bottom: 2px solid var(--c-text-ultra-light);
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md);

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm);
			}

			tbody tr:nth-child(even) td {
				background: var(--c-box-2);
			}

			:is(th, td) {
				padding: 0.625rem;
			}

			th {
				padding-block: 1em;
				border-bottom: 2px solid var(--c-text-ultra-light);
				font-size: 0.875em;
				color: var(--c-text-extra-light);

				&:not([align]) {
					text-align: left;
				}
			}
		}

		:global(:first-child) {
			margin-top: 0;
		}

		:global(:last-child) {
			margin-bottom: 0;
		}
	}
</style>
