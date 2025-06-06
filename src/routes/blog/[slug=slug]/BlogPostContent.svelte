<script lang="ts">
	import { mount } from 'svelte';
	import TableOfContents from './TableOfContents.svelte';

	export let html: string;

	// Inject Table of Contents; to include TOC, add <div id="#table-of-contents"> to Ghost content
	function injectTOC(node: HTMLElement) {
		const target = node.querySelector('#table-of-contents');
		if (target) {
			const entries = node.querySelectorAll('h2, h3') as NodeListOf<HTMLHeadingElement>;
			mount(TableOfContents, { target, props: { entries } });
		}
	}

	// Make tables mobile friendly by wrapping with container to allow horizontal scrolling
	function wrapTables(node: HTMLElement) {
		node.querySelectorAll('table').forEach((tableEl: HTMLTableElement) => {
			const wrapper = document.createElement('div');
			wrapper.classList.add('table-wrapper');
			tableEl.parentNode!.insertBefore(wrapper, tableEl);
			wrapper.appendChild(tableEl);
		});
	}
</script>

<div class="blog-post-content" use:injectTOC use:wrapTables>
	{@html html}
</div>

<style>
	.blog-post-content {
		--blog-post-font: var(--f-text-md-regular);
		--blog-post-letter-spacing: var(--f-text-md-spacing, normal);
		font: var(--blog-post-font);
		letter-spacing: (--blog-post-letter-spacing);
		overflow: auto;

		@media (--viewport-sm-up) {
			--blog-post-font: var(--f-text-lg-regular);
			--blog-post-letter-spacing: var(--f-text-lg-spacing, normal);
		}

		:global(:is(p, li)) {
			font: var(--blog-post-font);
			letter-spacing: (--blog-post-letter-spacing);
		}

		:global(p:not(:first-of-type)) {
			margin-top: var(--space-lg);
		}

		:global(h1) {
			font: var(--f-heading-lg-medium);
			margin: var(--space-2xl) 0 !important;
			text-transform: capitalize;
		}

		:global(> h2) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
			margin: var(--space-5xl) 0 var(--space-lg);
			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
			}
		}

		:global(> h3) {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
			margin: var(--space-xl) 0 var(--space-md) 0;
			@media (--viewport-xs) {
				font: var(--f-heading-sm-medium);
			}
		}

		:global(> h4) {
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--f-heading-sm-spacing, normal);
			margin: var(--space-xl) 0 var(--space-md) 0;
			@media (--viewport-xs) {
				font: var(--f-heading-xs-medium);
			}
		}

		:global(:is(ol, ul)) {
			margin: 0;
		}

		:global(li) {
			margin: 0.5em 0 0 0;
			padding-left: var(--space-xxs);
		}

		:global(:is(a, a:hover)) {
			text-decoration: underline;
			color: inherit;
		}

		:global(:is(strong, b)) {
			font-weight: 600;
		}

		:global(figure) {
			display: grid;
			margin: var(--space-3xl) 0 var(--space-5xl);

			:global(img) {
				height: 100%;
				width: 100%;
			}
		}

		:global(figcaption) {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			text-align: center;
			margin: var(--space-md) 0;
			/* fix Firefox scroll issue due to Ghost-added `white-space: pre-wrap` property */
			overflow: hidden;

			:global(a) {
				font-weight: 500;
			}
		}

		:global(iframe) {
			border: 0;
			width: 100%;
			min-height: 450px;
		}

		:global(.kg-image-card) {
			text-align: center;
		}

		:global(.kg-image) {
			width: 100%;
			height: auto;
			max-width: 100%;
			display: inline-block;
		}

		:global(pre) {
			margin: var(--space-lg) 0;
			border-radius: var(--radius-sm);
			padding: var(--space-ms) var(--space-ls);
			background: var(--c-terminal-bg);
			color: var(--c-terminal);
			font: var(--f-mono-sm-regular);
			letter-spacing: var(--f-mono-sm-spacing, normal);

			@media (--viewport-sm-up) {
				border-radius: var(--radius-md);
				padding: var(--space-md) var(--space-lg);
				font: var(--f-mono-md-regular);
				letter-spacing: var(--f-mono-md-spacing, normal);
			}
		}

		:global(blockquote) {
			margin: var(--space-lg) 0 var(--space-lg) var(--space-sl);
			padding: var(--space-lg);
			font: var(--f-text-lg-regular);
			letter-spacing: var(--f-text-lg-spacing, normal);
			background: var(--c-quoteblock-background);
			box-shadow: -0.75rem 0.75rem 0 var(--c-quoteblock-backdrop);
		}

		:global(.table-wrapper) {
			overflow-x: auto;
			overflow-y: hidden;
		}

		:global(table) {
			margin-block: var(--space-lg);
			border-collapse: collapse;
			color: inherit;

			:global(:is(td, th)) {
				padding: var(--space-ss);
				border-block: 1px solid var(--c-text-extra-light);
				vertical-align: top;

				&:first-child {
					padding-left: 0;
				}

				&:last-child {
					padding-right: 0;
				}
			}

			:global(th) {
				background: var(--c-box-2);
				font-weight: 600;
			}
		}

		/* JavaScript generated TOC */
		:global(#table-of-contents) {
			display: contents;
		}
	}
</style>
