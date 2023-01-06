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
		font: var(--text-input-font, var(--font));
		height: var(--text-input-height, var(--height));
		letter-spacing: var(--text-input-letter-spacing, var(--letter-spacing, normal));
		max-width: var(--text-input-max-width, auto);
		width: var(--text-input-width, auto);

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
		--border-radius: var(--radius-xs);
		--height: 2rem;
		--font: var(--f-ui-sm-roman);
		--letter-spacing: var(--f-ui-sm-spacing, normal);
	}

	.size-md {
		--border-radius: var(--radius-xs);
		--height: 2.25rem;
		--font: var(--f-ui-md-roman);
		--letter-spacing: var(--f-ui-md-spacing, normal);
	}

	.size-lg {
		--border-radius: var(--radius-sm);
		--height: 2.625rem;
		--font: var(--f-ui-lg-roman);
		--letter-spacing: var(--f-ui-lg-spacing, normal);
	}

	.size-xl {
		--border-radius: var(--radius-md);
		--height: 3rem;
		--font: var(--f-ui-xl-roman);
		--letter-spacing: var(--f-ui-xl-spacing, normal);
	}

	input:is([type='email'], [type='password'], [type='search'], [type='text']) {
		width: inherit;
		padding: 0 var(--space-sl);
		border: 1px transparent solid;
		border-radius: var(--border-radius);
		background: hsla(var(--hsl-v2-box), var(--a-v2-box-b));
		font: inherit;
		color: var(--c-text-1-v1);
		transition: background var(--time-sm) ease-out;

		&::placeholder {
			color: hsl(var(--hsl-text-extra-light));
		}

		&:disabled {
			background: hsla(var(--hsl-v2-box), var(--a-v2-box-a));
		}

		&:focus,
		&:hover {
			background: hsla(var(--hsl-v2-box), var(--a-v2-box-c));
		}

		&:focus {
			border-color: hsla(var(--hsl-v2-text-extra-light));
			outline: none;
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
