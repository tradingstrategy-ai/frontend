<script lang="ts">
	export let label: string | number;
	export let value: number;
	export let disabled = false;
</script>

{#if disabled}
	<span>{label}</span>
{:else}
	<button {value}>{label}</button>
{/if}

<style lang="postcss">
	button,
	span {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		padding: 0 0.25rem;
	}

	button {
		background: none;
		border: none;
		cursor: pointer;
		transition: color var(--time-xs) ease-out;

		&:hover {
			color: var(--c-text);
		}

		@nest :global(nav:hover) &:not(:hover) {
			color: var(--c-text-ultra-light);
		}
	}

	span {
		color: var(--c-text-ultra-light);
		cursor: not-allowed;
	}
</style>
