<!-- A tooltip component used with key metrics

See

- https://codepen.io/GemmaCroad/pen/LYpbdom

- https://stackoverflow.com/a/40628352/315168
-->

<script lang="ts">
	import { Icon } from '$lib/components';

	export let title = '';
	export let icon = null;
	export let iconClass = null;
</script>

<dfn class="key-metric-tooltip">
	{title}
	<span class={`icon-wrapper ${iconClass}`}>
		{#if icon}
			<Icon name={icon} />
		{/if}
	</span>
	<button>
		<slot />
	</button>
</dfn>

<style lang="postcss">
	dfn::before {
		content: attr(title);
		padding: 0 0 1em;
	}

	dfn button {
		display: none;
		position: absolute;
	}

	/* Pop-up content */
	dfn:hover button,
	dfn:focus button {
		display: block;
		text-align: left;

		--c-accent: var(--hsl-box);
		background: hsla(var(--c-accent));
		color: hsla(var(--hsl-text));
		outline-color: var(--c-accent);
		outline-offset: -1px;

		font: var(--f-ui-small-light);

		/* Need z-index or otherwise the warning text below might be rendered on the top of this text */
		z-index: 10000;
	}

	.key-metric-tooltip :global(a) {
		text-decoration: underline;
	}

	.key-metric-tooltip :global(p) {
		margin-bottom: 0.5em;
	}

	.icon-wrapper {
		color: hsla(var(--hsl-text));
	}

	.icon-warning {
		color: hsla(var(--hsl-warning));
	}
</style>
