<!--
@component
A tooltip component used with key metrics

See:
- https://codepen.io/GemmaCroad/pen/LYpbdom
- https://stackoverflow.com/a/40628352/315168
- https://svelte.dev/tutorial/named-slots
-->
<script lang="ts">
</script>

<dfn class="key-metric-tooltip">
	<slot name="tooltip-trigger" class="tooltip-trigger">
	</slot>
	<button>
		<slot name="tooltip-popup"/>
	</button>
</dfn>

<style lang="postcss">

	.key-metric-tooltip {

		&::before {
			content: attr(title);
			padding: 0 0 1em;
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
