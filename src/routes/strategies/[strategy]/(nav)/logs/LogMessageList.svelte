<!--
@component
Display log messages as a scrollable panel
-->
<script lang="ts">
	import { DateTime } from '$lib/components';

	type LogMessage = {
		timestamp: number;
		level: string;
		message: string;
	};

	export let logs: LogMessage[];

	// https://stackoverflow.com/questions/73987081/scroll-to-bottom-of-element-in-sveltekit
	function scrollToBottom(node: HTMLElement) {
		const scroll = () => node.scrollBy(0, node.scrollHeight);
		scroll();
		return { update: scroll };
	}
</script>

<div class="log-panel" use:scrollToBottom={logs}>
	{#each logs as log}
		<div class="entry level--{log.level}">
			<DateTime epoch={log.timestamp} withSeconds />
			<span class="message">
				{log.message}
			</span>
		</div>
	{/each}
</div>

<style lang="postcss">
	.log-panel {
		background: black;
		max-height: 70vh;
		overflow-y: scroll;
		font: var(--f-mono-body-regular);
		letter-spacing: var(--f-mono-body-spacing);
		/* optimize for high information density */
		font-size: 12px;
		line-height: 1em;
	}

	.entry {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1.25rem;
		border-block: 1px solid #222;
		padding: 0.5rem 1rem;
		background: black;
		font-weight: bolder;

		& .message {
			white-space: pre-line;
		}

		& :global .date-time {
			display: flex;
			flex-direction: column;
			color: #888;
			text-align: right;
		}
	}

	.level--info {
		color: lightgrey;
	}
	.level--trade {
		color: lightgreen;
	}
	.level--warning {
		color: lightyellow;
	}
	.level--error {
		color: lightcoral;
	}
	.level--critical {
		background: red;
		color: white;
	}
</style>
