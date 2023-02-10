<script lang="ts">
	export let active = false;
	export let disabled = false;
	export let label: string | number;
	export let value: number;
</script>

{#if disabled}
	<span class="disabled">{label}</span>
{:else if active}
	<span class="active">{label}</span>
{:else}
	<button {value}>{label}</button>
{/if}

<style lang="postcss">
	button,
	span {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		padding: 0 var(--space-xxs);
	}

	button {
		background: none;
		color: hsla(var(--hsl-text-extra-light));
		border: none;
		cursor: pointer;
		transition: color var(--time-xs) ease-out;

		&:hover {
			color: hsla(var(--hsl-text));
		}

		@nest :global(nav:hover) &:not(:hover) {
			color: var(--c-text-extra-light);
		}
	}

	span {
		cursor: not-allowed;

		&.active {
			color: hsla(var(--hsl-text));
		}

		&.disabled {
			color: hsla(var(--hsl-text-extra-light));
		}
	}
</style>
