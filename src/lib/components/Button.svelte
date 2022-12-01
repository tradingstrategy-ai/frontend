<script lang="ts">
	import { Icon } from '$lib/components';

	export let disabled = false;
	export let download: string | boolean | undefined = undefined;
	export let external = false;
	export let href: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let label: string = '';
	export let lg = false;
	export let quarternary = false;
	export let secondary = false;
	export let sm = false;
	export let tertiary = false;
	export let submit = false;
	export let tabindex: number | undefined = undefined;
	export let target: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let xxl = false;
	export let xl = false;
	export let xs = false;

	$: tag = href && !disabled ? 'a' : 'button';
	$: kind = quarternary ? 'quarternary' : tertiary ? 'tertiary' : secondary ? 'secondary' : 'primary';
	$: size = xxl ? 'xxl' : xl ? 'xl' : lg ? 'lg' : sm ? 'sm' : xs ? 'xs' : 'md';
	$: type = submit ? 'submit' : 'button';
</script>

<svelte:element
	this={tag}
	class="button {kind} {size}"
	disabled={disabled || undefined}
	download={download === true ? '' : download}
	{href}
	rel={external ? 'external' : undefined}
	{tabindex}
	{target}
	{title}
	type={tag === 'button' ? type : undefined}
	on:click
>
	<slot>{label}</slot>
	{#if icon}<Icon name={icon} />{/if}
</svelte:element>

<style lang="postcss">
	.button {
		display: inline-flex;
		gap: var(--button-gap, 0.625rem);
		justify-content: center;
		align-items: center;
		padding: var(--button-padding, 0.75rem 1rem);
		border: 1px solid transparent;
		border-radius: var(--button-border-radius, var(--border-radius-md));
		font: var(--button-font, var(--f-ui-md-medium));
		letter-spacing: var(--button-letter-spacing, var(--f-ui-md-spacing, normal));
		text-decoration: none;
		text-transform: capitalize;
		text-align: center;
		cursor: pointer;
	}

	.primary {
		background: var(--c-background-3-v1);
		color: var(--c-text-6-v1);
		border-color: var(--c-background-3-v1);

		&:hover,
		&:focus {
			background: var(--cm-light, var(--c-gray-extra-dark)) var(--cm-dark, var(--c-parchment-extra-dark));
			border-color: var(--cm-light, var(--c-gray-extra-dark)) var(--cm-dark, var(--c-parchment-extra-dark));
		}
	}

	.secondary {
		background: transparent;
		color: var(--c-text-1-v1);
		border-color: var(--c-border-2-v1);

		&:hover,
		&:focus {
			background: var(--cm-light, var(--c-parchment-dark)) var(--cm-dark, var(--c-gray-extra-dark));
			border-color: var(--cm-light, inherit) var(--cm-dark, var(--c-gray-dark));
		}
	}

	.tertiary {
		background: var(--c-background-3);
	}

	.quarternary {
		background: var(--c-background-4);
	}

	.xs {
		--button-border-radius: var(--border-radius-lg);
		--button-gap: 0.5rem;
		--button-padding: 0.375rem 0.75rem;
		--button-font: var(--f-ui-sm-medium);
		--button-letter-spacing: var(--f-ui-sm-spacing);
	}
	.sm {
		--button-padding: 0.5rem 0.75rem;
		--button-gap: 0.5rem;
	}
	.lg {
		--button-gap: 0.625rem;
		--button-padding: 1rem;
		--button-font: var(--f-ui-lg-medium);
		--button-letter-spacing: var(--f-ui-lg-spacing);
	}
	.xl {
		--button-gap: 0.75rem;
		--button-padding: 1rem 1.25rem;
		--button-font: var(--f-ui-xl-medium);
		--button-letter-spacing: var(--f-ui-xl-spacing);
	}
	.xxl {
		--button-gap: 0.75rem;
		--button-padding: 1.25rem;
		--button-font: var(--f-ui-xl-medium);
		--button-letter-spacing: var(--f-ui-xl-spacing);
	}

	:focus {
		outline: none;
	}

	:active {
		opacity: 0.8;
	}

	.button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
