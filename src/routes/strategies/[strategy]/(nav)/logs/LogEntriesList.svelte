<!--
@component
Display log messages as a scrollable panel
-->
<script lang="ts">
	import type { LogMessage } from '$lib/components/types';
	import LogEntry from './LogEntry.svelte';
	export let logs: LogMessage[];
</script>

<div class="log-panel terminal-viewport">
	{#each logs.reverse() as log}
		<LogEntry {log} />
	{/each}
</div>

<style lang="postcss">
	.log-panel {
		display: flex;
		flex-direction: column-reverse;
		font: var(--f-mono-sm-regular);
		letter-spacing: var(--f-mono-sm-spacing);
		max-height: calc(100vh - 18rem);
		overflow-y: scroll;
		overscroll-behavior: contain;
		scroll-snap-type: y proximity;
	}

	.log-panel :global(.log-entry:last-of-type) {
		scroll-snap-align: end;
		scroll-margin-block-end: 1rem;
	}
</style>
