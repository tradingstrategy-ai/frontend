<!--
@component
Display a button. Adaptively uses correct HTML element (anchor or button)
depending on supplied props. Button label may be included as a prop or the
default slot (or ommitted for icon-only buttons). Supports four style variants
using flags: primary (default), secondary, ternary, quarternary.

#### Usage:
```tsx
	<Button
		label="Click here!"
		icon="link"
		secondary
		size="lg"
		disabled
		href="http://example.org"
		target="_blank"
		title="include for accessibility when label ommitted"
		on:click={() => console.log('clicked!')}
	/>
```
-->
<script lang="ts">
	import { Icon } from '$lib/components';

	let classes = '';
	export { classes as class };
	export let disabled: boolean | undefined = undefined;
	export let download: string | boolean | undefined = undefined;
	export let rel: string | undefined = undefined;
	export let href: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let label: string = '';
	export let ghost = false;
	export let quarternary = false;
	export let secondary = false;
	export let tertiary = false;
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md';
	export let submit = false;
	export let tabindex: number | undefined = undefined;
	export let target: string | undefined = undefined;
	export let title: string | undefined = undefined;

	$: tag = href && !disabled ? 'a' : 'button';
	$: hasLabel = $$slots.default || label;
	$: kind = ghost ? 'ghost' : quarternary ? 'quarternary' : tertiary ? 'tertiary' : secondary ? 'secondary' : 'primary';
	$: allClasses = `button ${kind} ${size} ${classes}`;

	$: linkAttrs = {
		href,
		rel,
		target,
		download: typeof download === 'string' ? download : download ? '' : undefined
	};

	$: buttonAttrs = {
		disabled,
		type: submit ? 'submit' : undefined
	};

	$: attrs = tag === 'a' ? linkAttrs : buttonAttrs;
</script>

<svelte:element this={tag} {...attrs} class={allClasses} {tabindex} {title} on:click>
	{#if hasLabel}
		<span><slot>{label}</slot></span>
	{/if}
	<slot name="icon">
		{#if icon}<Icon name={icon} />{/if}
	</slot>
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
		--icon-size: 1.5rem;
	}

	.button > span {
		margin: 0 var(--space-xs) !important;
	}

	.primary {
		--c-accent: var(--hsl-box), var(--a-box-d);
		background: hsla(var(--c-accent));
		color: hsla(var(--hsl-text));
		outline-color: var(--c-accent);
		outline-offset: -1px;

		&:hover,
		&:focus {
			--c-accent: var(--hsl-text), 1;
			color: hsla(var(--hsl-text-inverted));
		}
	}

	.secondary {
		background: transparent;
		color: hsla(var(--hsl-text));
		border-color: hsla(var(--hsl-text));

		&:hover,
		&:focus {
			background: hsla(var(--hsl-text));
			color: hsla(var(--hsl-text-inverted));
		}
	}

	.tertiary {
		background: hsla(var(--hsl-box), var(--a-box-b));
		color: hsla(var(--hsl-text));
		border-color: transparent;

		&:hover,
		&:focus {
			background: hsla(var(--hsl-box), var(--a-box-d));
		}
	}

	.quarternary {
		background: var(--c-background-4);
	}

	.ghost {
		background: transparent;
		text-decoration: underline;
		--button-padding: 0 var(--space-xxs) !important;
	}

	.xs {
		--button-border-radius: var(--radius-lg);
		--button-gap: var(--space-ss);
		--button-padding: var(--space-xs) var(--space-xs);
		--button-font: var(--f-ui-sm-medium);
		--button-letter-spacing: var(--f-ui-sm-spacing);
	}
	.sm {
		--button-gap: var(--space-xs);
		--button-padding: var(--space-ss) var(--space-sl);
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
