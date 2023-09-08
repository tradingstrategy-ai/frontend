<!--
	Page to display trade exeuctor logs with log level filter.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type LogEntry from './LogEntry.svelte';
	import LogEntriesList from './LogEntriesList.svelte';
	import { SummaryBox, Tabs } from '$lib/components';

	export let data;

	const levels = {
		trade: { label: 'Trade', number: 21 },
		info: { label: 'Info', number: 20 }
	} as const;

	let selected: keyof typeof levels = 'trade';

	type LogItem = ComponentProps<LogEntry> & { level_number: number };

	$: logs = data.logs.filter(({ level, level_number }: LogItem) => {
		return level === selected || level_number >= levels[selected]?.number;
	});
</script>

<section class="logs">
	<SummaryBox title="Strategy logs" subtitle="Choose logging level">
		<Tabs items={levels} bind:selected --tab-padding="var(--space-lg) 0 0">
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
