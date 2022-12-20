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
		gap: var(--space-xl);
		margin: var(--space-lg) 0 var(--space-4xl) 0;
		padding: var(--space-lg);
		border: var(--c-border-2-v1) solid 1px;

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
