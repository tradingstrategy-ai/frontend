<script lang="ts">
	import { Icon } from '$lib/components';

	type TextInputType = 'email' | 'text' | 'search';
	export let type: TextInputType = 'text';
	export let disabled = false;
	type TextInputSize = 'sm' | 'md' | 'lg' | 'xl';
	export let size: TextInputSize = 'md';
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

<style>
	.wrapper {
		position: relative;
		display: inline-grid;
		width: var(--text-input-width, auto);
		max-width: var(--text-input-max-width, auto);
		font-weight: 400;
	}

	.size-sm {
		font: var(--fs-ui-sm);
	}

	.size-md {
		font: var(--fs-ui-md);
	}

	.size-lg {
		font: var(--fs-ui-lg);
	}

	.size-xl {
		font: var(--fs-ui-xl);
	}

	input {
		width: inherit;
		padding: 0 0.5em;
		height: 2.125em;
		border-radius: 0.5rem;
		border: 2px solid var(--c-border-2);
		background: var(--c-body);
		letter-spacing: 0.01em;
		color: var(--c-text-1);
	}

	input::placeholder {
		color: var(--c-text-7);
	}

	input:disabled {
		background: var(--c-background-2);
	}

	input:focus {
		outline: var(--c-background-4) solid 2px;
		outline-offset: 0px;
		box-shadow: 0 0 8px 2px var(--c-background-2);
	}

	.disabled {
		opacity: 0.65;
	}

	.has-icon input {
		text-indent: 1.125em;
	}

	.wrapper :global(svg) {
		position: absolute;
		top: 0.75em;
		left: 0.625em;
		font-size: 0.875em;
	}

	input[type='search']::-webkit-search-cancel-button {
		-webkit-appearance: none;
	}

	.cancel-btn {
		display: none;
	}

	.wrapper:focus-within .cancel-btn,
	.wrapper:hover .cancel-btn {
		display: inline;
	}

	.cancel-btn :global(svg) {
		left: auto;
		font-size: 0.7em;
		top: 1em;
		right: 0.625em;
	}
</style>
