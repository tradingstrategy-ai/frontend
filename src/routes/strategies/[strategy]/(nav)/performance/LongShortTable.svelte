<script lang="ts">
	import type { LongShortTable, StatisticsTableMetric } from 'trade-executor/statistics/statistics-table';
	import { SummaryBox } from '$lib/components';

	function isDurationField({ kind }: StatisticsTableMetric) {
		return /period_length|duration_of/.test(kind);
	}

	function durationShortLabel(duration?: string) {
		return duration?.replaceAll(/ (?:days|hours|minutes)/g, (s) => s[1]);
	}

	export let tableData: LongShortTable;
</script>

<SummaryBox title="Performance metrics">
	<div class="long-short-table">
		<table>
			<thead>
				<tr>
					<th class="name">Metric</th>
					{#each tableData.columns as column}
						<th class={column.toLowerCase()}>
							{column}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each Object.values(tableData.rows) as row (row.kind)}
					<tr>
						<td class="name">{row.name}</td>
						{#each tableData.columns as column}
							{@const value = row.value[column]}
							<td class={column.toLowerCase()}>
								{#if isDurationField(row)}
									<span class="desktop">{value}</span>
									<span class="mobile">{durationShortLabel(value)}</span>
								{:else}
									{value}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</SummaryBox>

<style lang="postcss">
	.long-short-table {
		overflow-x: auto;
		margin-inline: var(--margin-inline, 0);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--ls-ui-md);
		--heading-font-size: 0.875em;
		--padding: 0.625rem;

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--ls-ui-sm);
			--padding: 0.5rem;
			--margin-inline: -1rem;

			.desktop {
				display: none;
			}
		}

		@media (--viewport-md-up) {
			.mobile {
				display: none;
			}
		}

		table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 1rem;
			text-align: left;
			white-space: nowrap;

			th {
				padding: 1em var(--padding);
				font-size: var(--heading-font-size);
				color: hsl(var(--hsl-text-extra-light));
			}

			tbody {
				border-block: 2px solid hsl(var(--hsl-text-ultra-light));

				tr:nth-child(even) {
					background: hsl(var(--hsla-box-2));
				}

				td {
					padding: var(--padding);

					@media (--viewport-xs) {
						padding-block: 0;
						height: 2.5rem;
						line-height: 1.2;
					}
				}

				.name {
					font-size: var(--heading-font-size);
					font-weight: 500;
					color: hsl(var(--hsl-text-light));
					white-space: normal;
					min-width: 9rem;
				}
			}

			:is(.all, .long, .short) {
				text-align: right;
			}
		}
	}
</style>
