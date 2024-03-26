<!--
	Page to display trade exeuctor logs with log level filter.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type LogEntry from './LogEntry.svelte';
	import LogEntriesList from './LogEntriesList.svelte';
	import { SegmentedControl } from '$lib/components';

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
	<header>
		<h4>Strategy Logs</h4>
		<div class="levels">
			<SegmentedControl options={Object.keys(levels)} bind:selected />
		</div>
	</header>
	<!-- key block is needed to reset scroll position -->
	{#key selected}
		<LogEntriesList {logs} />
	{/key}
</section>

<style lang="postcss">
	.logs {
		display: grid;
		grid-template-rows: auto 1fr;

		header {
			align-items: center;
			margin-bottom: 1rem;

			h4 {
				font: var(--f-heading-xs-medium);
			}

			:global([data-css-props]) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

		:global(.log-panel) {
			min-height: 20rem;
		}
	}
</style>
