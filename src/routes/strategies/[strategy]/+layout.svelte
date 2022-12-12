<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	export let data: LayoutData;

	$: summary = data.summary;

	$: breadcrumbs = {
		[summary.id]: summary.name,
		'open-positions': 'Open positions',
		...$page.data.breadcrumbs
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<slot />
