<!--
@component
Display a text input component (email, text or search types currently supported). Passes
unknown props through to HTML input element.

#### Usage:
```tsx
	<TextInput bind:value type="email" size="lg" placeholder="email" required {disabled} />
```
-->
<script lang="ts">
	import { Icon } from '$lib/components';

	export let type: 'email' | 'text' | 'search' | 'password' = 'text';
	export let disabled = false;
	export let label = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let value = '';

	const icon = type === 'search' ? 'search' : undefined;
	const cancelButton = type === 'search';

	let inputEl: HTMLInputElement;

	$: tag = $$slots.label || label ? 'label' : 'span';

	export function focus(options = {}) {
		inputEl.focus(options);
	}
</script>

<svelte:element this={tag} class="text-input size-{size}" class:has-icon={icon} class:disabled>
	{#if $$slots.label || label}
		<slot name="label">
			<span class="label">{label}</span>
		</slot>
	{/if}
	<input
		bind:this={inputEl}
		{value}
		{type}
		{disabled}
		{...$$restProps}
		on:input={({ target }) => (value = target.value)}
		on:input
		on:focus
		on:blur
		on:keydown
	/>

	{#if icon}
		<Icon name={icon} />
	{/if}

	{#if cancelButton && value}
		<span class="cancel-btn" on:pointerdown|preventDefault={() => (value = '')}>
			<Icon name="cancel" />
		</span>
	{/if}
</svelte:element>

<style lang="postcss">
	.text-input {
		position: relative;
		display: inline-grid;
		gap: var(--space-xs);
		max-width: var(--text-input-max-width, auto);
		width: var(--text-input-width, auto);
		font: var(--text-input-font, var(--font));
		letter-spacing: var(--text-input-letter-spacing, var(--letter-spacing, normal));
		color: var(--c-text);

		.label,
		[slot='label'] {
			font-weight: 500;
		}

		&.disabled {
			opacity: 0.65;
		}

		&.has-icon input {
			text-indent: 1.125em;
		}

		:global svg {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			left: 0.625em;
			font-size: 0.875em;
		}

		&.size-sm {
			--border-radius: var(--radius-xs);
			--height: 2rem;
			--font: var(--f-mono-sm-regular);
			--letter-spacing: var(--f-mono-sm-spacing);
			font-weight: 600;

			input::placeholder {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}
		&.size-md {
			--border-radius: var(--radius-xs);
			--height: 2.25rem;
			--font: var(--f-mono-md-regular);
			--letter-spacing: var(--f-mono-md-spacing);
			font-weight: 600;

			input::placeholder {
				font: var(--f-ui-md-roman);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}
		}
		&.size-lg {
			--border-radius: var(--radius-sm);
			--height: 2.625rem;
			--font: var(--f-mono-lg-regular);
			--letter-spacing: var(--f-mono-lg-spacing);
			font-weight: 600;

			input::placeholder {
				font: var(--f-ui-lg-roman);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}
		&.size-xl {
			--border-radius: var(--radius-md);
			--height: 3rem;
			--font: var(--f-mono-xl-regular);
			--letter-spacing: var(--f-mono-xl-spacing);
			font-weight: 600;

			input::placeholder {
				font: var(--f-ui-xl-roman);
				letter-spacing: var(--f-ui-xl-roman, normal);
			}
		}

		input {
			width: inherit;
			height: var(--text-input-height, var(--height));
			padding: 0 var(--space-sl);
			border: 1px var(--c-input-border) solid;
			border-radius: var(--border-radius);
			background: var(--c-input-background);
			font: inherit;
			letter-spacing: inherit;
			color: inherit;
			transition: background var(--time-sm) ease-out;

			&::placeholder {
				color: var(--c-text-extra-light);
			}

			&:disabled {
				background: var(--c-box-1);
			}

			&:focus,
			&:hover {
				background: var(--c-input-background-focus);
			}

			&:focus {
				border-color: var(--c-input-border-focus);
				outline: none;
			}

			&[type='search'],
			&[type='search']::-webkit-search-cancel-button {
				-webkit-appearance: none;
			}
		}

		.cancel-btn {
			display: none;

			:global svg {
				left: auto;
				right: var(--space-md);
				font-size: 1rem;
			}
		}

		&:is(:hover, :focus-within) {
			:global .cancel-btn {
				display: contents;
			}
		}
	}
</style>
