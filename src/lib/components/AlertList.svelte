<script lang="ts">
	$: console.log($$slots);
</script>

{#if $$slots.default}
	<ul><slot /></ul>
{/if}

<style lang="postcss">
	ul {
		display: grid;
		gap: 1.5rem;
		max-width: 1020px;
		margin-inline: auto;
		padding: 1.5rem;
		border: 2px solid var(--c-bearish);
		list-style: none;

		@media (--viewport-md-down) {
			padding: 1rem;
		}

		&:not(:has(li)) {
			display: none;
		}
	}
</style>
