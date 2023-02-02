<!--
	Page to display trade exeuctor logs with log level filter.
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { SummaryBox, Tabs } from '$lib/components';
	import LogEntriesList from './LogEntriesList.svelte';

	export let data: PageData;
</script>

<section class="logs">
	<SummaryBox title="Strategy logs" subtitle="Choose logging level">
		<Tabs
			tabs={[
				{
					id: 'trade',
					title: 'Trade',
					component: LogEntriesList,
					props: {
						logs: data.logs.filter((entry) => entry.level === 'trade')
					}
				},
				{
					id: 'info',
					title: 'Info',
					component: LogEntriesList,
					props: {
						logs: data.logs.filter((entry) => entry.level === 'info')
					}
				}
			]}
			--tab-padding="var(--space-lg) 0 0"
		/>
	</SummaryBox>
</section>

<style>
	.logs :global(.summary-box) {
		position: sticky;
		top: 2rem;
	}
</style>
