<script lang="ts">
	import { Timestamp } from '$lib/components';

	export let timestamp: number;
	export let level: 'info' | 'trade' | 'warning' | 'error' | 'critical';
	export let message: string;
	export let formatted_data: Maybe<string[]> = undefined;
</script>

<div class="log-entry level--{level}">
	<Timestamp date={timestamp} withSeconds />
	<div class="message">
		{message}
		{#if formatted_data?.length}
			<details class="traceback">
				<summary>
					{formatted_data[0].trimEnd()}
					<span class="num-lines">({formatted_data.length - 1} lines)</span>
				</summary>
				{formatted_data.slice(1).join('')}
			</details>
		{/if}
	</div>
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
			font: var(--f-mono-xs-regular);
			letter-spacing: var(--f-mono-xs-spacing, normal);
			white-space: pre-wrap;

			details {
				margin-top: 1em;

				> summary {
					font-weight: bold;
					cursor: pointer;

					.num-lines {
						font-weight: normal;
					}
				}

				&[open] > summary {
					.num-lines {
						display: none;
					}
				}
			}
		}

		:global time {
			display: flex;
			font: var(--f-mono-sm-regular);
			letter-spacing: var(--f-mono-sm-spacing, normal);
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
