<script lang="ts">
	import TableOfContents from './_TableOfContents.svelte';

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
			tableEl.parentNode.insertBefore(wrapper, tableEl);
			wrapper.appendChild(tableEl);
		});
	}
</script>

<div use:injectTOC use:wrapTables>
	{@html html}
</div>

<style>
	div,
	div :global p,
	div :global ol li,
	div :global ul li {
		font: var(--f-text-small-regular);
	}

	div :global p:not(:first-of-type) {
		margin-top: 1.5rem;
	}

	div :global h2 {
		font: var(--f-text-large-semibold);
		margin: 3rem 0 1.5rem;
	}

	div :global h3 {
		font: var(--f-text-body-semibold);
		margin: 2rem 0 1rem 0;
	}

	div :global ol,
	div :global ul {
		margin: 0;
	}

	div :global li {
		margin: 0.5em 0 0 0;
		padding-left: 0.25rem;
	}

	div :global a,
	div :global a:hover {
		text-decoration: underline;
		font-weight: 600;
		color: inherit;
	}

	div :global strong,
	div :global b {
		font-weight: 600;
	}

	div :global figure {
		margin: 2.25rem 0;
	}

	div :global figcaption {
		font: 400 var(--fs-ui-sm);
		letter-spacing: 0.02em;
		text-align: center;
		margin: 1rem 0;
	}

	div :global figcaption a {
		font-weight: 500;
	}

	div :global iframe {
		border: 0;
		width: 100%;
		min-height: 450px;
	}

	div :global .kg-image-card {
		text-align: center;
	}

	div :global .kg-image {
		width: auto;
		height: auto;
		max-width: 100%;
		display: inline-block;
	}

	div :global pre {
		margin: 1.5rem 0;
		padding: 1.5rem;
		background: var(--c-background-7);
		border: 2px solid var(--c-border-1);
		border-radius: 0.375rem;
		color: var(--c-parchment);
	}

	div :global blockquote {
		margin: 1.5rem 0 1.5rem 0.75rem;
		padding: 1.5rem;
		font: var(--f-text-body-regular);
		color: var(--c-text-3);
		background: var(--c-background-1);
		box-shadow: -0.75rem 0.75rem 0 var(--c-background-4);
	}

	div :global .table-responsive {
		width: 100%;
		overflow-x: auto;
	}

	div :global table {
		margin: 1.5rem 0;
		color: inherit;
		border-collapse: collapse;
	}

	div :global table td,
	div :global table th {
		vertical-align: top;
		padding: 0.5rem;
		border-top: 1px solid var(--c-border-1);
		border-bottom: 1px solid var(--c-border-1);
	}

	div :global table th {
		background: var(--c-background-1);
		font-weight: 600;
	}

	div :global table td:first-child,
	div :global table th:first-child {
		padding-left: 0;
	}

	div :global table td:last-child,
	div :global table th:last-child {
		padding-right: 0;
	}

	/* JavaScript generated TOC */
	div :global #table-of-contents {
		display: contents;
	}
</style>
