<!--
@component
Display log messages as a scrollable panel
-->
<script lang="ts">
	import { fromUnixTime } from 'date-fns';

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
		{@const isoDate = fromUnixTime(log.timestamp).toISOString()}

		<div class="log log-{log.level}">
			<time datetime={isoDate}>
				<span>{isoDate.slice(0, 10)}</span>
				<span>{isoDate.slice(11, 19)}</span>
			</time>

			<span class="message">
				{log.message}
			</span>
		</div>
	{/each}
</div>

<style>
	.log-panel {
		background: black;
		max-height: 70vh;
		overflow-y: scroll;
		font: var(--f-mono-body-regular);
		letter-spacing: var(--f-mono-body-spacing);
	}

	.log {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1.25rem;
		border-block: 1px solid #666;
		padding: 0.5rem 1rem;
		background: black;
	}

	.log-info {
		color: grey;
	}

	.log-trade {
		color: green;
	}

	.log-warning {
		color: yellow;
	}

	.log-error {
		color: red;
	}

	.log-critical {
		background: red;
		color: white;
	}

	time {
		display: flex;
		flex-direction: column;
		color: #444;
		text-align: right;
	}

	.message {
		white-space: pre-line;
	}
</style>
