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
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
		height: 2rem;
	}

	.size-md {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		height: 2.25rem;
	}

	.size-lg {
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		height: 2.625rem;
	}

	.size-xl {
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing, normal);
		height: 3rem;
	}

	select {
		appearance: none;
		width: inherit;
		padding: 0 2em 0 0.8em;
		border: 2px solid var(--c-border-2-v1);
		border-radius: 0.5rem;
		background: var(--c-body-v1);
		font-weight: 500;
		color: var(--c-text-1-v1);

		&:disabled {
			background: var(--c-background-2-v1);
		}

		&:focus {
			outline: var(--c-background-4-v1) solid 2px;
			outline-offset: 0px;
			box-shadow: 0 0 8px 2px var(--c-background-2-v1);
		}
	}
</style>
