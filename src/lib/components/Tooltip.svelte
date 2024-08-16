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
	<span slot="trigger" class="underline">
		a piece of text with underline
	</span>
	<svelte:fragment slot="popup">
		Hello there
	</svelte:fragment>
</Tooltip>
```
-->
<dfn class="tooltip ds-3">
	<span class="trigger">
		<slot name="trigger" />
	</span>
	<!-- popup MUST be a button element (disabled); see Tooltip.test.ts -->
	<button class="popup" disabled>
		<div class="inner">
			<slot name="popup" />
		</div>
	</button>
</dfn>

<style lang="postcss">
	.tooltip {
		.trigger {
			font-style: normal;
			cursor: pointer;

			/* Utility class to provide affordance that the trigger is interactive */
			:global(.underline) {
				border-bottom: 1px dotted var(--c-text-light);
			}
		}

		.popup {
			display: none;
			position: absolute;
			contain: content;
			width: min(90vw, 32rem, auto);
			padding: 0.25rem 0 0 0;
			border: none;
			background: transparent;
			white-space: normal;
			/* Need z-index or otherwise the warning text below might be rendered on the top of this text */
			z-index: 10000;

			@media (--viewport-sm-down) {
				bottom: 1rem;
				position: fixed;
				left: 0.5rem;
				right: 0.5rem;
				padding: 0;
			}

			.inner {
				padding: 1rem;
				border: 1px solid var(--c-box-3);
				border-radius: var(--radius-ms);
				background: var(--c-text-inverted);
				box-shadow: var(--shadow-3);
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm);
				color: var(--c-text);
				text-align: left;
			}

			:global(a) {
				text-decoration: underline;
				font-weight: 500;
			}

			:global(p) {
				margin-bottom: 0.5em;
			}
		}

		&:is(:hover, :focus) .popup {
			display: block;
		}
	}
</style>
