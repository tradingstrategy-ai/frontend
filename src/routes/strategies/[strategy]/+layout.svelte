<script lang="ts">
	import type { LayoutData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	export let data: LayoutData;

	$: summary = data.summary;

	$: breadcrumbs = {
		[summary.id]: summary.name,
		'open-positions': 'Open positions'
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<slot />
