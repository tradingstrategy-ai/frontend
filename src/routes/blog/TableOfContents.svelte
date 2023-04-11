<script lang="ts">
	import { SummaryBox } from '$lib/components';
	export let entries: NodeListOf<HTMLElement>;
</script>

<!-- Have different CSS class for TOC entries whether they are H2 or H3 based -->
<div class="table-of-contents">
	<SummaryBox title="Table of Contents">
		{#each entries as { id, innerText, tagName } (id)}
			<a class="tile b {`toc-entry-${tagName.toLowerCase()}`}" href="#{id}">{innerText}</a>
		{/each}
	</SummaryBox>
</div>

<style lang="postcss">
	.table-of-contents {
		& a {
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--f-heading-xs-spacing, normal);
			padding: var(--space-sm) var(--space-md);
			text-decoration: none !important;
		}

		& .toc-entry-h3 {
			margin-left: 1em;
		}
	}
</style>
