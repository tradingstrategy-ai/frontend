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

<div use:injectTOC use:wrapTables>
	{@html html}
</div>

<style lang="postcss">
	div :global {
		overflow: auto;

		&,
		& p,
		& ol li,
		& ul li {
			font: var(--f-text-lg-regular);
			letter-spacing: var(--f-text-lg-spacing, normal);
		}

		& p:not(:first-of-type) {
			margin-top: 1.5rem;
		}

		& h2 {
			font: var(--f-text-xl-semibold);
			letter-spacing: var(--f-text-xl-spacing, normal);
			margin: 3rem 0 1.5rem;
		}

		& h3 {
			font: var(--f-text-lg-semibold);
			letter-spacing: var(--f-text-lg-spacing, normal);
			margin: 2rem 0 1rem 0;
		}

		& ol,
		& ul {
			margin: 0;
		}

		& li {
			margin: 0.5em 0 0 0;
			padding-left: 0.25rem;
		}

		& a,
		& a:hover {
			text-decoration: underline;
			font-weight: 600;
			color: inherit;
		}

		& strong,
		& b {
			font-weight: 600;
		}

		& figure {
			margin: 2.25rem 0;
		}

		& figcaption {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			text-align: center;
			margin: 1rem 0;

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
			width: auto;
			height: auto;
			max-width: 100%;
			display: inline-block;
		}

		& pre {
			margin: 1.5rem 0;
			padding: 1.5rem;
			background: var(--c-background-7-v1);
			border: 2px solid var(--c-border-1-v1);
			border-radius: 0.375rem;
			color: var(--c-parchment);
		}

		& blockquote {
			margin: 1.5rem 0 1.5rem 0.75rem;
			padding: 1.5rem;
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
			margin: 1.5rem 0;
			color: inherit;
			border-collapse: collapse;

			& td,
			& th {
				vertical-align: top;
				padding: 0.5rem;
				border-top: 1px solid var(--c-border-1-v1);
				border-bottom: 1px solid var(--c-border-1-v1);
			}

			& th {
				background: var(--c-background-1-v1);
				font-weight: 600;
			}

			& td:first-child,
			& th:first-child {
				padding-left: 0;
			}

			& td:last-child,
			& th:last-child {
				padding-right: 0;
			}
		}

		/* JavaScript generated TOC */
		& #table-of-contents {
			display: contents;
		}
	}
</style>
