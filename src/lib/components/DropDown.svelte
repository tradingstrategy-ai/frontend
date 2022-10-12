<!-- 
TODO:
- bind value
- bubble events
- test on mobile
- documentation
-->
<script lang="ts">
	import { Icon } from '$lib/components';

	export let disabled = false;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let value: any = undefined;
</script>

<span class="size-{size}" class:disabled>
	<Icon name="chevron-down" />

	<select bind:value {disabled} on:change on:focus on:blur>
		<slot />
	</select>
</span>

<style lang="postcss">
	span {
		position: relative;
		display: inline-grid;
		width: var(--drop-down-width, auto);
		max-width: var(--drop-down-max-width, auto);

		&.disabled {
			opacity: 0.65;
		}

		& :global svg {
			position: absolute;
			top: 50%;
			transform: translatey(-50%);
			right: 1em;
			font-size: 0.8em;
			pointer-events: none;
		}
	}

	.size-sm {
		font: var(--fs-ui-sm);
		height: 2rem;
	}

	.size-md {
		font: var(--fs-ui-md);
		height: 2.25rem;
	}

	.size-lg {
		font: var(--fs-ui-lg);
		height: 2.625rem;
	}

	.size-xl {
		font: var(--fs-ui-xl);
		height: 3rem;
	}

	select {
		appearance: none;
		width: inherit;
		padding: 0 2em 0 0.8em;
		border: 2px solid var(--c-border-2);
		border-radius: 0.5rem;
		background: var(--c-body);
		font-weight: 500;
		color: var(--c-text-1);

		&:disabled {
			background: var(--c-background-2);
		}

		&:focus {
			outline: var(--c-background-4) solid 2px;
			outline-offset: 0px;
			box-shadow: 0 0 8px 2px var(--c-background-2);
		}
	}
</style>
