<script lang="ts">
	export let entries: NodeListOf<HTMLElement>;
</script>

<div>
	<h3>Table of Contents</h3>
	{#each entries as { id, innerText } (id)}
		<a href="#{id}">{innerText}</a>
	{/each}
</div>

<style lang="postcss">
	div {
		display: grid;
		gap: 1.5rem;
		margin: 1.25rem 0 2.25rem 0;
		padding: 1.25rem;
		border: var(--c-border-2) solid 1px;

		& h3 {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
			margin: 0;
		}

		& a {
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--f-heading-xs-spacing, normal);

			&:not(:hover) {
				text-decoration: none;
			}
		}
	}
</style>
