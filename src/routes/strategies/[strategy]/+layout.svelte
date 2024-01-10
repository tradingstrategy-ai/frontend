<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	export let data;

	$: ({ strategy } = data);

	$: breadcrumbs = {
		[strategy.id]: strategy.name,
		'open-positions': 'Open positions',
		'closed-positions': 'Closed positions',
		'frozen-positions': 'Frozen positions',
		performance: 'Performance',
		'decision-making': 'Decision making',
		status: 'Instance status',
		logs: 'Logs',
		source: 'Source Code',
		backtest: 'Backtest results',
		...$page.data.breadcrumbs
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<div class="ds-3" style:display="contents">
	<slot />
</div>
