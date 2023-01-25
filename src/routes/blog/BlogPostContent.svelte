<script lang="ts">
	import TableOfContents from './TableOfContents.svelte';

	export let html: string;

	// Inject Table of Contents; to include TOC, add <div id="#table-of-contents"> to Ghost content
	function injectTOC(node: HTMLElement) {
		const target = node.querySelector('#table-of-contents');
		if (target) {
			const entries = node.querySelectorAll('h2');
			new TableOfContents({ target, props: { entries } });
		}
	}

	// Make tables mobile friendly by wrapping with container to allow horizontal scrolling
	function wrapTables(node: HTMLElement) {
		node.querySelectorAll('table').forEach((tableEl) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'table-responsive';
			tableEl.parentNode?.insertBefore(wrapper, tableEl);
			wrapper.appendChild(tableEl);
		});
	}
</script>

<div class="blog-post-content" use:injectTOC use:wrapTables>
	{@html html}
</div>

<style lang="postcss">
	.blog-post-content :global {
		overflow: auto;

		& h1 {
			font: var(--f-heading-lg-medium);
			margin: var(--space-2xl) 0 !important;
			text-transform: capitalize;
		}

		&,
		& :is(p, li) {
			font: var(--f-text-lg-regular);
			letter-spacing: var(--f-text-lg-spacing, normal);
		}

		& p:not(:first-of-type) {
			margin-top: var(--space-lg);
		}

		& h2 {
			font: var(--f-text-xl-semibold);
			letter-spacing: var(--f-text-xl-spacing, normal);
			margin: var(--space-5xl) 0 var(--space-lg);
		}

		& h3 {
			font: var(--f-text-lg-semibold);
			letter-spacing: var(--f-text-lg-spacing, normal);
			margin: var(--space-xl) 0 var(--space-md) 0;
		}

		& :is(ol, ul) {
			margin: 0;
		}

		& li {
			margin: 0.5em 0 0 0;
			padding-left: var(--space-xxs);
		}

		& a,
		& a:hover {
			text-decoration: underline;
			color: inherit;
		}

		& :is(strong, b) {
			font-weight: 600;
		}

		& figure {
			display: grid;
			margin: var(--space-3xl) 0 var(--space-5xl);

			& img {
				height: 100%;
				width: 100%;
			}
		}

		& figcaption {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			text-align: center;
			margin: var(--space-md) 0;

			& a {
				font-weight: 500;
			}
		}

		& iframe {
			border: 0;
			width: 100%;
			min-height: 450px;
		}

		& .kg-image-card {
			text-align: center;
		}

		& .kg-image {
			width: 100%;
			height: auto;
			max-width: 100%;
			display: inline-block;
		}

		& pre {
			margin: var(--space-lg) 0;
			padding: var(--space-lg);
			background: var(--c-background-7-v1);
			border: 2px solid var(--c-border-1-v1);
			border-radius: var(--radius-xxs);
			color: var(--c-parchment);
		}

		& blockquote {
			margin: var(--space-lg) 0 var(--space-lg) var(--space-sl);
			padding: var(--space-lg);
			font: var(--f-text-lg-regular);
			letter-spacing: var(--f-text-lg-spacing, normal);
			color: var(--c-text-3-v1);
			background: var(--c-background-1-v1);
			box-shadow: -0.75rem 0.75rem 0 var(--c-background-4-v1);
		}

		& .table-responsive {
			width: 100%;
			overflow-x: auto;
		}

		& table {
			margin: var(--space-lg) 0;
			color: inherit;
			border-collapse: collapse;

			& :is(td, th) {
				vertical-align: top;
				padding: var(--space-ss);
				border-top: 1px solid var(--c-border-1-v1);
				border-bottom: 1px solid var(--c-border-1-v1);

				&:first-child {
					padding-left: 0;
				}

				&:last-child {
					padding-right: 0;
				}
			}

			& th {
				background: var(--c-background-1-v1);
				font-weight: 600;
			}
		}

		/* JavaScript generated TOC */
		& #table-of-contents {
			display: contents;
		}
	}
</style>
