<!--

    Page to display trade exeuctor logs with log level filter.

-->
<script lang="ts">
	import LogMessageList from './LogMessageList.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let chosenLevel = 'trade';

	// Filter logs to chosen level
	function filterLogs(rawLogs, level) {
		return rawLogs.filter((entry) => !(level === 'trade' && entry.level === 'info'));
	}

	$: logs = filterLogs(data.logs, chosenLevel);
</script>

<div class="log-level-choice">
	<label>
		<input type="radio" bind:group={chosenLevel} name="chosenLevel" value="trade" checked />
		Level: trade
	</label>

	<label>
		<input type="radio" bind:group={chosenLevel} name="chosenLevel" value="info" />
		Level: info
	</label>
</div>

<LogMessageList {logs} />

<style>
	.log-level-choice {
		display: flex;
		gap: 1rem;
	}
</style>
