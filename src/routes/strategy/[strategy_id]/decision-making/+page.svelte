<!--

    Page to display the source code of the strategy.

    TODO: Add nice source code formatting widget
-->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// Currently loaded source code
	$: imageUrls = data.imageUrls;


</script>

<p>
    {imageUrls.light}
</p>

<img class="light" scr={imageUrls.light}>
