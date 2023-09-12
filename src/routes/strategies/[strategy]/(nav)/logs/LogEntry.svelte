<script lang="ts">
	import { Timestamp } from '$lib/components';

	export let timestamp: number;
	export let level: 'info' | 'trade' | 'warning' | 'error' | 'critical';
	export let message: string;
</script>

<div class="log-entry level--{level}">
	<Timestamp date={timestamp} format="iso" withSeconds />
	<span class="message">
		{message}
	</span>
</div>

<style lang="postcss">
	.log-entry {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-ss);
		place-items: stretch;

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}

		&:not(:first-of-type, :last-of-type) {
			border-block: 1px solid var(--c-ink-light);
		}

		.message {
			/* display: inline-flex; */
			overflow-x: auto;
			white-space: pre-line;
			font: var(--f-mono-xs-regular);
		}

		:global time {
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
		color: var(--c-text-light-night);
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
