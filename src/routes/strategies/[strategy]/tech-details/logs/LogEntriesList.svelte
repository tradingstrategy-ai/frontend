<!--
@component
Display log messages as a scrollable panel
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import LogEntry from './LogEntry.svelte';

	export let logs: ComponentProps<LogEntry>[];
</script>

<div class="log-panel terminal-viewport xs" class:empty={logs.length === 0}>
	<!-- `reverse()` mutates the original array; use `toReversed` instead -->
	{#each logs.toReversed() as { timestamp, level, message, formatted_data }}
		<LogEntry {timestamp} {level} {message} {formatted_data} />
	{:else}
		No logs to display (try changing log level)
	{/each}
</div>

<style lang="postcss">
	.log-panel {
		display: flex;
		flex-direction: column-reverse;
		max-height: calc(100vh - 18rem);
		padding: var(--space-ss) var(--space-sl);
		overflow-y: scroll;
		overscroll-behavior: contain;
		scroll-snap-type: y proximity;

		&.empty {
			flex-direction: column;
		}
	}

	.log-panel :global(.log-entry:last-of-type) {
		scroll-snap-align: end;
		scroll-margin-block-end: var(--space-md);
	}
</style>
