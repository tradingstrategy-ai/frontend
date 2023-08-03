<!--
@component
A tooltip component used with key metrics

The component includes an `underline` utility CSS class that
can be used in the `trigger` slot element if desired.

For more information see:
- https://codepen.io/GemmaCroad/pen/LYpbdom
- https://stackoverflow.com/a/40628352/315168
- https://svelte.dev/tutorial/named-slots

#### Usage
```tsx
<Tooltip>
	<span slot="trigger">
		a piece of text with underline
	</span>
	<div slot="popup">
		Hello there
	</div>
</Tooltip>
```
-->
<dfn class="tooltip">
	<span class="trigger">
		<slot name="trigger" />
	</span>
	<button>
		<slot name="popup" />
	</button>
</dfn>

<style lang="postcss">
	.tooltip {
		& .trigger {
			cursor: pointer;
			/* Undo base CSS abbr font style */
			font-style: normal;

			/* Give user hint the value is clickable / hoverable */
			& :global(.underline) {
				border-bottom: 1px dotted hsla(var(--hsl-text-light));
			}
		}

		& button {
			display: none;
			position: absolute;
		}

		/* Pop-up content */
		&:is(:hover, :focus) button {
			display: block;
			text-align: left;

			--c-accent: var(--hsl-box);
			background: var(--c-background-4);
			color: hsla(var(--hsl-text));
			outline-color: var(--c-accent);
			outline-offset: -1px;

			font: var(--f-ui-small-light);

			/* Need z-index or otherwise the warning text below might be rendered on the top of this text */
			z-index: 10000;

			padding: var(--space-sl);
		}

		& :global(a) {
			text-decoration: underline;
		}

		& :global(p) {
			margin-bottom: 0.5em;
		}
	}
</style>
