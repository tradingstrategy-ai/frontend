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
	<span class="popup">
		<slot name="popup" />
	</span>
</dfn>

<style lang="postcss">
	@import './css/radius-new.css';

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

		& .popup {
			display: none;
			position: absolute;
			width: min(90vw, 32rem, auto);
			translate: 0 0.5rem;

			@media (--viewport-sm-down) {
				bottom: 1rem;
				position: fixed;
				left: 0.5rem;
				right: 0.5rem;
				width: calc(100% - 1rem);
			}
		}

		/* Pop-up content */
		&:is(:hover, :focus) .popup {
			display: block;
			text-align: left;

			--c-accent: var(--hsl-box);
			background: linear-gradient(hsla(var(--hsla-box-1)), hsla(var(--hsla-box-1))),
				linear-gradient(hsla(var(--hsl-body)), hsla(var(--hsl-body)));
			border: 1px solid hsla(var(--hsla-box-3));
			border-radius: var(--radius-xs);
			box-shadow: var(--shadow-1);
			color: hsla(var(--hsl-text));
			outline-color: var(--c-accent);
			outline-offset: -1px;

			font: var(--f-ui-small-light);

			/* Need z-index or otherwise the warning text below might be rendered on the top of this text */
			z-index: 10000;

			padding: 0.875rem;
		}

		& :global(a) {
			text-decoration: underline;
		}

		& :global(p) {
			margin-bottom: 0.5em;
		}
	}
</style>
