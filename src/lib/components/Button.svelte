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
	let classes = '';
	export { classes as class };
	export let disabled: boolean | undefined = undefined;
	export let download: string | boolean | undefined = undefined;
	export let rel: string | undefined = undefined;
	export let href: string | undefined = undefined;
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
	$: role = tag === 'a' ? 'link' : 'button';
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

<svelte:element this={tag} {...attrs} class={allClasses} {tabindex} {title} {role} data-css-props on:click>
	{#if hasLabel}
		<span><slot>{label}</slot></span>
	{/if}
	<slot name="icon" />
</svelte:element>

<style>
	[data-css-props] {
		--icon-size: 1.25em;
		--button-border-radius: var(--radius-md);

		&.xs {
			--button-border-radius: var(--radius-lg);
			--button-padding: 0.375rem 0.75rem;
			--button-font: var(--f-ui-sm-medium);
			--button-letter-spacing: var(--f-ui-sm-spacing);
		}
		&.sm {
			--button-padding: 0.5rem 1.125rem;
			--button-font: var(--f-ui-md-medium);
			--button-letter-spacing: var(--f-ui-md-spacing);
		}
		&.md {
			--button-padding: 0.75rem 1.375rem;
			--button-font: var(--f-ui-md-medium);
			--button-letter-spacing: var(--f-ui-md-spacing);
		}
		&.lg {
			--button-padding: 1rem 1.375rem;
			--button-font: var(--f-ui-lg-medium);
			--button-letter-spacing: var(--f-ui-lg-spacing);
		}
		&.xl {
			--button-padding: 1rem 1.375rem;
			--button-font: var(--f-ui-xl-medium);
			--button-letter-spacing: var(--f-ui-xl-spacing);
		}

		&.ghost {
			--button-padding: 0 0.25rem;
		}
	}

	.button {
		display: inline-flex;
		gap: 0.5em;
		justify-content: center;
		align-items: center;
		width: var(--button-width, auto);
		padding: var(--button-padding);
		border: 1px solid transparent;
		border-radius: var(--button-border-radius);
		font: var(--button-font);
		letter-spacing: var(--button-letter-spacing, normal);
		transition: all var(--time-sm) ease-out;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
	}

	.primary {
		--c-accent: var(--c-box-4);
		background: var(--c-accent);
		color: var(--c-text);
		outline-color: var(--c-accent);
		outline-offset: -1px;

		&:is(:hover, :focus):not([disabled]) {
			--c-accent: var(--c-text);
			color: var(--c-text-inverted);
		}
	}

	.secondary {
		background: transparent;
		color: var(--c-text);
		border-color: var(--c-text);

		&:is(:hover, :focus):not([disabled]) {
			background: var(--c-text);
			color: var(--c-text-inverted);
		}
	}

	.tertiary {
		background: var(--c-box-2);
		color: var(--c-text);
		border-color: transparent;

		&:is(:hover, :focus):not([disabled]) {
			background: var(--c-box-4);
		}
	}

	.quarternary {
		background: var(--c-box-2);
	}

	.ghost {
		background: transparent;
		text-decoration: underline;
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
