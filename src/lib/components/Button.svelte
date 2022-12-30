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
		gap: var(--button-gap, var(--space-sm));
		justify-content: center;
		align-items: center;
		width: var(--button-width, auto);
		padding: var(--button-padding, var(--space-sl) var(--space-md));
		border: 1px solid transparent;
		border-radius: var(--button-border-radius, var(--radius-md));
		font: var(--button-font, var(--f-ui-md-medium));
		letter-spacing: var(--button-letter-spacing, var(--f-ui-md-spacing, normal));
		transition: all var(--time-sm) ease-out;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
	}

	.primary {
		--c-accent: hsla(var(--hsl-v2-box), var(--a-v2-box-d));
		background: var(--c-accent);
		color: hsla(var(--hsl-v2-text));
		outline-color: var(--c-accent);
		outline-offset: -1px;

		&:hover,
		&:focus {
			--c-accent: hsla(var(--hsl-v2-text), 1);
			color: hsla(var(--hsl-v2-text-inverted));
		}
	}

	.secondary {
		background: transparent;
		color: hsla(var(--hsl-v2-text));
		border-color: hsla(var(--hsl-v2-text));

		&:hover,
		&:focus {
			background: hsla(var(--hsl-v2-text));
			color: hsla(var(--hsl-v2-text-inverted));
		}
	}

	.tertiary {
		background: hsla(var(--hsl-v2-box), var(--a-v2-box-b));
		color: hsla(var(--hsl-v2-text));
		border-color: transparent;

		&:hover,
		&:focus {
			background: hsla(var(--hsl-v2-box), 0.4);
		}
	}

	.quarternary {
		background: var(--c-background-4);
	}

	.xs {
		--button-border-radius: var(--radius-lg);
		--button-gap: var(--space-ss);
		--button-padding: var(--space-xs) var(--space-sl);
		--button-font: var(--f-ui-sm-medium);
		--button-letter-spacing: var(--f-ui-sm-spacing);
	}
	.sm {
		--button-padding: var(--space-ss) var(--space-sl);
		--button-gap: var(--space-ss);
	}
	.lg {
		--button-gap: var(--space-sm);
		--button-padding: var(--space-md);
		--button-font: var(--f-ui-lg-medium);
		--button-letter-spacing: var(--f-ui-lg-spacing);
	}
	.xl {
		--button-gap: var(--space-sl);
		--button-padding: var(--space-md) var(--space-md);
		--button-font: var(--f-ui-xl-medium);
		--button-letter-spacing: var(--f-ui-xl-spacing);
	}
	.xxl {
		--button-gap: var(--space-sl);
		--button-padding: var(--space-md);
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
