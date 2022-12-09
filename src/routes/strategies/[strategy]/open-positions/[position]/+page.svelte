<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p style:background="lightblue">This is the position overview page!</p>
<p>Data keys: <code>{Object.keys(data).join(', ')}</code></p>
