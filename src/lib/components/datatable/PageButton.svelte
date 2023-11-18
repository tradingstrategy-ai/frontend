<script lang="ts">
	export let active = false;
	export let disabled = false;
	export let label: string | number;
	export let value: number;
</script>

{#if active || disabled}
	<span class:active class:disabled>{label}</span>
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
		border: none;
		color: hsl(var(--hsl-text-extra-light));
		cursor: pointer;
		transition: color var(--time-xs) ease-out;

		&:hover {
			color: hsl(var(--hsl-text));
		}

		:global(nav:hover) &:not(:hover) {
			color: hsl(var(--hsl-text-extra-light));
		}
	}

	span {
		cursor: not-allowed;

		&.active {
			color: hsl(var(--hsl-text));
		}

		&.disabled {
			color: hsl(var(--hsl-text-extra-light));
		}
	}
</style>
