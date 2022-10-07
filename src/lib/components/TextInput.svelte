<script lang="ts">
	import { Icon } from '$lib/components';

	export let type: 'email' | 'text' | 'search' = 'text';
	export let disabled = false;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let value = '';

	const icon = type === 'search' ? 'search' : undefined;
	const cancelButton = type === 'search';
</script>

<span class="wrapper size-{size}" class:has-icon={icon} class:disabled>
	<input
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
</span>

<style lang="postcss">
	.wrapper {
		position: relative;
		display: inline-grid;
		width: var(--text-input-width, auto);
		height: var(--text-input-height, var(--height));
		max-width: var(--text-input-max-width, auto);
		font-weight: 400;

		&.disabled {
			opacity: 0.65;
		}

		&.has-icon input {
			text-indent: 1.125em;
		}

		& :global svg {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			left: 0.625em;
			font-size: 0.875em;
		}
	}

	.size-sm {
		--height: 2rem;
		font: var(--fs-ui-sm);
	}

	.size-md {
		--height: 2.25rem;
		font: var(--fs-ui-md);
	}

	.size-lg {
		--height: 2.625rem;
		font: var(--fs-ui-lg);
	}

	.size-xl {
		--height: 3rem;
		font: var(--fs-ui-xl);
	}

	input {
		width: inherit;
		padding: 0 0.5em;
		border: 2px solid var(--c-border-2);
		border-radius: 0.5rem;
		background: var(--c-body);
		color: var(--c-text-1);

		&::placeholder {
			color: var(--c-text-7);
		}

		&:disabled {
			background: var(--c-background-2);
		}

		&:focus {
			outline: var(--c-background-4) solid 2px;
			outline-offset: 0px;
			box-shadow: 0 0 8px 2px var(--c-background-2);
		}

		&[type='search']::-webkit-search-cancel-button {
			-webkit-appearance: none;
		}
	}

	.cancel-btn {
		display: none;

		& :global svg {
			left: auto;
			right: 0.625em;
			font-size: 0.7em;
		}
	}

	.wrapper {
		&:focus-within .cancel-btn,
		&:hover .cancel-btn {
			display: contents;
		}
	}
</style>
