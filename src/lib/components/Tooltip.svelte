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
<dfn class="tooltip ds-3">
	<span class="trigger">
		<slot name="trigger" />
	</span>
	<span class="popup">
		<slot name="popup" />
	</span>
</dfn>

<style lang="postcss">
	.tooltip {
		&,
		& :global(span) {
			font-style: normal;
		}

		& .trigger {
			cursor: pointer;

			& :global(.underline) {
				border-bottom: 1px dotted hsla(var(--hsl-text-light));
			}
		}

		& .popup {
			display: none;
			position: absolute;
			width: min(90vw, 32rem, auto);

			@media (--viewport-sm-down) {
				bottom: 1rem;
				position: fixed;
				left: 0.5rem;
				right: 0.5rem;
				width: calc(100% - 1rem);
			}
		}

		&:is(:hover, :focus) .popup {
			display: block;
			text-align: left;

			background: hsla(var(--hsl-text-inverted));
			border: 1px solid hsla(var(--hsl-box-3));
			border-radius: var(--radius-md);
			box-shadow: var(--shadow-3);
			color: hsla(var(--hsl-text));

			font: var(--f-ui-small-light);

			/* Need z-index or otherwise the warning text below might be rendered on the top of this text */
			z-index: 10000;

			padding: 1.125rem;
		}

		& :global(a) {
			text-decoration: underline;
		}

		& :global(p) {
			margin-bottom: 0.5em;
		}
	}
</style>
