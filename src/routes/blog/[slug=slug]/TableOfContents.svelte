<script lang="ts">
	import { SummaryBox } from '$lib/components';
	export let entries: NodeListOf<HTMLElement>;
</script>

<div class="table-of-contents">
	<SummaryBox title="Table of Contents">
		{#each entries as { id, innerText, tagName } (id)}
			<!-- Specify different CSS class for TOC entries based on tag (h2, h3) -->
			<a class="tile b {`toc-entry-${tagName.toLowerCase()}`}" href="#{id}">{innerText}</a>
		{/each}
	</SummaryBox>
</div>

<style>
	.table-of-contents {
		:global(.summary-box .main) {
			gap: var(--space-sm);
		}

		a {
			font: var(--f-heading-xs-medium);
			font-size: 80%;
			letter-spacing: var(--f-heading-xs-spacing, normal);
			padding: var(--space-xs) var(--space-md);
			text-decoration: none !important;
		}

		.toc-entry-h3 {
			margin-left: 1em;
		}
	}
</style>
