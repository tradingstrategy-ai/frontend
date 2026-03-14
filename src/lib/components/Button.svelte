<!--
@component
Display a button. Adaptively uses correct HTML element (anchor or button)
depending on supplied props. Button label may be included as a prop or the
default slot (or ommitted for icon-only buttons). Supports four style variants
using flags: primary (default), secondary, ternary, quarternary.

@example

```svelte
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
	export let primaryHeroBanner = false;
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
	$: kind = ghost ? 'ghost' : quarternary ? 'quarternary' : tertiary ? 'tertiary' : secondary ? 'secondary' : primaryHeroBanner ? 'primary-hero-banner' : 'primary';
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

	.primary-hero-banner {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		color: var(--c-text-inverted);
		border-color: color-mix(in srgb, var(--c-text-light), transparent 26%);
		backdrop-filter: blur(0.9rem) saturate(1.18);
		background:
			radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--c-text-light), transparent 12%) 0%, transparent 34%),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-text-light), transparent 8%),
				color-mix(in srgb, var(--c-text-light), transparent 22%) 46%,
				color-mix(in srgb, var(--c-box-1), transparent 18%) 100%
			),
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--c-text-light), transparent 18%),
				color-mix(in srgb, var(--c-text-light), transparent 38%)
			),
			color-mix(in srgb, var(--c-text-light), var(--c-box-1) 28%);
		box-shadow:
			0 1.4rem 3rem color-mix(in srgb, var(--c-text-inverted), transparent 80%),
			0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 72%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 14%),
			inset 0 -1.2rem 2.4rem color-mix(in srgb, var(--c-text-inverted), transparent 90%);

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background:
				linear-gradient(
					115deg,
					transparent 0%,
					color-mix(in srgb, var(--c-text-light), transparent 76%) 28%,
					transparent 54%
				),
				radial-gradient(circle at top left, color-mix(in srgb, var(--c-text-light), transparent 72%) 0%, transparent 42%);
			opacity: 0.75;
			pointer-events: none;
			mix-blend-mode: screen;
		}

		&:is(:hover, :focus):not([disabled]) {
			color: var(--c-text-inverted);
			border-color: color-mix(in srgb, var(--c-text-light), transparent 18%);
			background:
				radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--c-text-light), transparent 6%) 0%, transparent 36%),
				linear-gradient(
					180deg,
					color-mix(in srgb, var(--c-text-light), transparent 4%),
					color-mix(in srgb, var(--c-text-light), transparent 18%) 46%,
					color-mix(in srgb, var(--c-box-1), transparent 10%) 100%
				),
				linear-gradient(
					135deg,
					color-mix(in srgb, var(--c-text-light), transparent 14%),
					color-mix(in srgb, var(--c-text-light), transparent 32%)
				),
				color-mix(in srgb, var(--c-text-light), var(--c-box-1) 20%);
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
