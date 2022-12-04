<!--

    Page to display the source code of the strategy.

    TODO: Add nice source code formatting widget
-->
<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	// Currently loaded source code
	$: source = data.source;

</script>


<pre class="source">
    {source}
</pre>

<style lang="postcss">
    .source {
        background: var(--cm-light, var(--c-parchment-extra-dark)) var(--cm-dark, var(--c-gray-extra-dark));
        font-weight: bold;
    }
</style>