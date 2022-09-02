<script lang="ts">
	export let entries: NodeListOf<HTMLElement>;
</script>

<div>
	<h3>Table of Contents</h3>
	{#each entries as { id, innerText } (id)}
		<a href="#{id}">{innerText}</a>
	{/each}
</div>

<style>
	div {
		display: grid;
		gap: 1.5rem;
		margin: 1.25rem 0 2.25rem 0;
		padding: 1.25rem;
		border: var(--c-border-2) solid 1px;
	}

	/**
	 * NOTE: using ">" child selector below for higher specificity to override global CSS
	 * used in /blog/[slug].svelte.
	 */

	div > h3 {
		font: 600 var(--fs-heading-lg);
		margin: 0;
	}

	div > a {
		font: 600 var(--fs-heading-xs);
		text-decoration: none;
	}

	div > a:hover {
		text-decoration: underline;
	}
</style>
