<!--

    Page to display the source code of the strategy.

    TODO: Add nice source code formatting widget
-->
<script lang="ts">
	export let source;

	// Currently loaded source code
	$: sourceLines = source.split('\n');
</script>

<pre class="source">
    {#each sourceLines as line}
		<code>{line}</code><br />
	{/each}
</pre>

<style lang="postcss">
	pre {
		background: var(--cm-light, var(--c-parchment-dark)) var(--cm-dark, var(--c-ink));
		color: var(--cm-light, var(--c-text-1-v1)) var(--cm-dark, var(--c-text-1-v1));
		font-weight: bold;
		padding: 5px;
		counter-reset: line;
		width: 100%;

		white-space: normal;
		overflow-x: scroll;
	}

	code {
		counter-increment: line;
		overflow-x: scroll;
		white-space: pre;
	}

	code:before {
		display: inline-block;
		content: counter(line);
		user-select: none;
		width: 40px;
		opacity: 0.5;
	}
</style>
