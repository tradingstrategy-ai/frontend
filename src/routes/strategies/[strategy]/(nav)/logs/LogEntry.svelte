<script lang="ts">
	import { DateTime } from '$lib/components';
	import type { LogMessage } from '$lib/components/types';

	export let log: LogMessage;
</script>

<div class="log-entry level--{log.level}">
	<DateTime epoch={log.timestamp} withSeconds />
	<span class="message">
		{log.message}
	</span>
</div>

<style lang="postcss">
	.log-entry {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1.5rem;
		padding: 1rem 0.5rem;
		place-items: stretch;

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}

		&:not(:first-of-type, :last-of-type) {
			border-block: 1px solid var(--c-ink-light);
		}

		& .message {
			/* display: inline-flex; */
			overflow-x: auto;
			white-space: pre-line;
			font: var(--f-mono-xs-regular);
		}

		& :global .date-time {
			display: flex;
			font: var(--f-mono-sm-regular);
			flex-direction: column;
			color: var(--c-text-ultra-light);

			@media (--viewport-sm-up) {
				text-align: right;
			}
		}
	}

	.level--info {
		color: var(--c-text-light);
	}
	.level--trade {
		color: palegreen;
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
