<!--
@component
Display log messages as a scrollable panel
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import LogEntry from './LogEntry.svelte';

	export let logs: ComponentProps<LogEntry>[];
</script>

<div class="log-panel terminal-viewport">
	<!-- `reverse()` mutates the original array, so we need to call it on a copy -->
	{#each [...logs].reverse() as { timestamp, level, message, formatted_data }}
		<LogEntry {timestamp} {level} {message} {formatted_data} />
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
		scroll-margin-block-end: var(--space-md);
	}
</style>
