<script lang="ts">
	import Icon from './Icon.svelte';

	type TextInputType = 'text' | 'search';
	export let type: TextInputType = 'text';
	export let disabled = false;
	export let value = '';

	const icon = type === 'search' ? 'search' : undefined;
	const cancelButton = type === 'search';
</script>

<span class="wrapper" class:has-icon={icon} class:disabled>
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
		display: inline-block;
		width: var(--text-input-width, auto);
	}

	input {
		width: var(--text-input-width, auto);
		padding: 0 0.5rem;
		height: 2.125rem;
		border-radius: 0.375rem;
		border: 2px solid var(--c-border-2);
		background: var(--c-body);
		font: 500 14px/14px var(--ff-display);
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
		text-indent: 1rem;
	}

	.wrapper :global(svg) {
		position: absolute;
		top: 0.625rem;
		left: 0.5rem;
		font-size: 14px;
	}

	input[type='search']::-webkit-search-cancel-button {
		-webkit-appearance: none;
	}

	.wrapper:not(:focus-within) .cancel-btn {
		display: none;
	}

	.cancel-btn :global(svg) {
		left: auto;
		top: 0.75rem;
		right: 0.5rem;
		font-size: 10px;
	}
</style>
