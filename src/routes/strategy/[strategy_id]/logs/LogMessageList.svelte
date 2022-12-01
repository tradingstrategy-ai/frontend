<!--
@component

Display log messages as a scrollable panel

-->
<script lang="ts">
	export let logs;

	let logListElem;

	interface LogMessage {
		timestamp: number;
		level: string;
		message: strnming;
	}

	// Convert UNIX timestamp to UTC
	function formatDay(ts) {
		const d = new Date(ts * 1000);
		return `${d.getFullYear()}-${d.getUTCMonth()}-${d.getUTCDay()}`;
	}

	// Convert UNIX timestamp to UTC
	function formatTime(ts) {
		const d = new Date(ts * 1000);
		return `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getSeconds()}`;
	}

	// https://stackoverflow.com/questions/73987081/scroll-to-bottom-of-element-in-sveltekit
	const scrollToBottom = (node) => {
		const scroll = () =>
			node.scroll({
				top: node.scrollHeight,
				behavior: 'auto'
			});
		scroll();

		return { update: scroll };
	};
</script>

<div bind:this={logListElem} class="log-panel" use:scrollToBottom={logs}>
	{#each logs as log}
		<div class="log-outer">
			<div class={`log log-${log.level}`}>
				<span class="timestamp">
					<span class="date">
						{formatDay(log.timestamp)}
					</span>
					<br />
					<span class="date">
						{formatTime(log.timestamp)}
					</span>
				</span>

				<span class="message">
					{log.message}
				</span>
			</div>
		</div>
	{/each}
</div>

<style>
	.log-panel {
		width: 100%;
		background: black;
		max-height: 70vh;
		overflow-y: scroll;
	}

	.log-outer {
		background: #666;
		padding-bottom: 2px;
	}

	.log {
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

	.log {
		display: flex;
	}

	.log .timestamp {
		flex-grow: 0;
		flex-shrink: 0;
		flex-basis: 100px;
		margin-right: 10px;
		color: #444;
	}

	.log .message {
		flex-grow: 1;
		white-space: pre-line;
		font-family: monospace;
	}
</style>
