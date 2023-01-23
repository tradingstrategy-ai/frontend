<!-- 
@component
Display a theme-formatted drop-down (aka select) element.
Size flags of `sm | md | lg | xl` are supported (defaults to `md`).
Support (bubbles) `change`, `focus` and `blur` events.

#### Usage:
```tsx
	<DropDown bind:value={selectValue} disabled={true|false}>
		<option value="option 1 value">Open 1 label</option>
		<option value="option 2 value">Open 2 label</option>
	</DropDown>
```
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
		border-radius: var(--radius-xs);
		background: hsla(var(--hsl-body));
		font-weight: 500;
		color: var(--c-text-1-v1);

		&:disabled {
			background: var(--c-background-2-v1);
		}

		&:focus {
			outline: none;
			box-shadow: 0 0 8px 2px var(--c-background-2-v1);
		}
	}
</style>
