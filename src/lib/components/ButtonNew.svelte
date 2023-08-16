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
external
href="http://example.org"
target="_blank"
title="include for accessibility when label ommitted"
on:click={() => console.log('clicked!')}
/>

// or

<Button {...props}>
  Click here!
</Button>
```
-->

<script lang="ts">
	import Icon from './Icon.svelte';

	let classes = '';
	export { classes as class };
	export let disabled: boolean | undefined = undefined;
	export let download: string | boolean | undefined = undefined;
	export let rel: string | undefined = undefined;
	export let href: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let iconSize: string | undefined = undefined;
	export let iconPlacement: 'left' | 'right' = 'right';
	export let itemprop = '';
	export let itemtype = '';
	export let label: string = '';
	export let ghost = false;
	export let quarternary = false;
	export let secondary = false;
	export let tertiary = false;
	export let success = false;
	export let danger = false;
	export let warning = false;
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md';
	export let submit = false;
	export let tabindex: number | undefined = undefined;
	export let target: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let thisButton: any = undefined;

	$: tag = href && !disabled ? 'a' : 'button';
	$: hasLabel = $$slots.default || label;
	$: kind = success
		? 'success'
		: danger
		? 'danger'
		: warning
		? 'warning'
		: ghost
		? 'ghost'
		: quarternary
		? 'quarternary'
		: tertiary
		? 'tertiary'
		: secondary
		? 'secondary'
		: 'primary';
	$: allClasses = `button ${kind} ${size} ${classes} icon-${iconPlacement}`;

	$: linkAttrs = {
		href,
		rel,
		role: 'button',
		target,
		download: typeof download === 'string' ? download : download ? '' : undefined
	};

	$: buttonAttrs = {
		disabled,
		type: submit ? 'submit' : undefined
	};

	$: attrs = tag === 'a' ? linkAttrs : buttonAttrs;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={tag}
	{...attrs}
	class={allClasses}
	{itemprop}
	{itemtype}
	{tabindex}
	{title}
	bind:this={thisButton}
	on:click
	on:keydown|preventDefault
>
	{#if hasLabel}
		<span><slot>{label}</slot></span>
	{/if}
	<slot name="icon">
		{#if icon}<Icon name={icon} size={iconSize} />{/if}
	</slot>
</svelte:element>

<style lang="postcss">
	@import './css/radius-new.css';

	.button {
		align-items: center;
		border-radius: var(--radius-md);
		color: hsla(var(--hsl-text));
		cursor: pointer;
		display: inline-flex;
		font: var(--f-ui-md-medium);
		justify-content: center;
		text-decoration: none;
		transition: var(--transition-1);

		/* Sizes */

		&:where(.xxs, .xs) {
			font: var(--f-ui-sm-medium);
			gap: 0.375rem;
		}

		&.xxs {
			min-height: 1.5rem;
			padding-inline: 0.375rem;
		}

		&.xs {
			min-height: 1.75rem;
			padding-inline: 0.5rem;
		}

		&.sm {
			gap: 0.5rem;
			min-height: 2.25rem;
			padding-inline: 0.75rem;
		}

		&:where(.md, .lg, .xl) {
			gap: 0.625rem;
		}

		&.md {
			min-height: 2.75rem;
			padding-inline: 1rem;
		}

		&:where(.lg, .xl) {
			padding-inline: 1.125rem;
		}

		&.lg {
			min-height: 3rem;
		}

		&.xl {
			min-height: 3.25rem;
		}

		/* Kinds */

		&:is(.primary, .secondary, .tertiary, .ghost) {
			color: hsla(var(--hsl-text));
		}

		&.primary {
			background: hsla(var(--hsla-box-4));
			border: 1px solid transparent;
		}

		&.secondary {
			background: transparent;
			border: 1px solid hsla(var(--hsl-text));
		}

		&:is(.primary, .secondary) {
			&:is(:hover, :focus) {
				background: hsla(var(--hsl-text));
				color: hsla(var(--hsl-text-inverted));
				outline: none;
			}

			&:active {
				background: hsla(var(--hsl-text), 0.625);
			}
		}

		&.tertiary {
			background: hsla(var(--hsla-box-2));
			border: 1px solid hsla(var(--hsla-box-3));

			&:is(:hover, :focus) {
				background: hsla(var(--hsl-text));
				color: hsla(var(--hsl-text-inverted));
			}
		}

		&.ghost {
			background: transparent;
			border: 1px solid transparent;

			&:is(:hover, :focus) {
				background: hsla(var(--hsl-text));
				color: hsla(var(--hsl-text-inverted));
			}
		}

		&.success {
			background: hsla(var(--hsl-bullish), 0.25);
			border: 1px solid transparent;
			color: hsla(var(--hsl-bullish));

			&:is(:hover, :focus) {
				background: hsla(var(--hsl-bullish));
				color: hsla(var(--hsl-white));
			}
		}

		&.danger {
			background: hsla(var(--hsl-bearish), 0.25);
			border: 1px solid transparent;
			color: hsla(var(--hsl-bearish));

			&:is(:hover, :focus) {
				background: hsla(var(--hsl-bearish));
				color: hsla(var(--hsl-white));
			}
		}

		&.warning {
			background: hsla(var(--hsl-warning), 0.15);
			border: 1px solid transparent;
			color: hsla(var(--hsl-warning));

			&:is(:hover, :focus) {
				background: hsla(var(--hsl-warning));
				color: hsla(var(--hsl-white));
			}
		}

		/* Other */
		&.icon-left {
			flex-direction: row-reverse;
		}
	}
</style>
