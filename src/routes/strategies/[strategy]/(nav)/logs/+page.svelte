<!--
	Page to display trade exeuctor logs with log level filter.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type LogEntry from './LogEntry.svelte';
	import LogEntriesList from './LogEntriesList.svelte';
	import { SummaryBox, Tabs } from '$lib/components';

	export let data;

	let selected: string;
	$: logs = data.logs.filter(({ level }: ComponentProps<LogEntry>) => level === selected);
</script>

<section class="logs">
	<SummaryBox title="Strategy logs" subtitle="Choose logging level">
		<Tabs items={{ trade: 'Trade', info: 'Info' }} bind:selected --tab-padding="var(--space-lg) 0 0">
			<LogEntriesList {logs} />
		</Tabs>
	</SummaryBox>
</section>

<style>
	.logs :global(.summary-box) {
		position: sticky;
		top: 2rem;
	}
</style>
