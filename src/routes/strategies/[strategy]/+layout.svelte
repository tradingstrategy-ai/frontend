<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	export let data;

	$: summary = data.summary;

	$: breadcrumbs = {
		[summary.id]: summary.name,
		'open-positions': 'Open positions',
		'closed-positions': 'Closed positions',
		'frozen-positions': 'Frozen positions',
		performance: 'Performance',
		'decision-making': 'Decision making',
		status: 'Instance status',
		logs: 'Logs',
		source: 'Source Code',
		...$page.data.breadcrumbs
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<slot />
