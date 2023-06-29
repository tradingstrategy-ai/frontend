<!-- A tooltip component used with key metrics

See

- https://codepen.io/GemmaCroad/pen/LYpbdom

- https://stackoverflow.com/a/40628352/315168
-->

<script lang="ts">
	export let title = '';
</script>

<dfn class="key-metric-tooltip" {title}>
	<button disabled>
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
	dfn:hover button,
	dfn:focus button {
		display: block;
		background: white;
		color: black;
		text-align: left;
	}

	.key-metric-tooltip :global(a) {
		text-decoration: underline;
	}

	.key-metric-tooltip :global(p) {
		margin-bottom: 0.5em;
	}
</style>
