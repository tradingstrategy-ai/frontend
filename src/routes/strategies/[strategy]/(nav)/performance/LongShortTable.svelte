<script lang="ts">
	import type { LongShortTable, StatisticsTableMetric } from 'trade-executor/statistics/statistics-table';
	import { SummaryBox, TextInput } from '$lib/components';

	export let tableData: LongShortTable;

	let filter = '';

	$: filteredRows = Object.values(tableData.rows).filter((row) => {
		return row.name?.toLowerCase().includes(filter.toLowerCase());
	});

	$: isBacktested = tableData.rows.trading_period_length?.source === 'backtesting';

	function isDurationField({ kind }: StatisticsTableMetric) {
		return /period_length|duration_of/.test(kind);
	}

	function durationShortLabel(duration = '') {
		return duration.replaceAll(/ (?:days|hours|minutes)/g, (s) => s[1]);
	}
</script>

<SummaryBox
	title="Performance metrics"
	subtitle="Strategy performance metrics based on {isBacktested ? 'backtesting' : 'live trading'} data."
	ctaPosition="top"
>
	<div slot="cta" class="wrapper">
		<TextInput bind:value={filter} size="md" type="search" placeholder="Filter metrics" />
	</div>
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
				{#each filteredRows as row (row.kind)}
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
				{:else}
					<tr>
						<td class="name no-match" colspan="4">no matching metrics</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</SummaryBox>

<style lang="postcss">
	.wrapper {
		display: contents;
		/* FIXME: overriding radius for now due to inconsistencies with radius.css and radius-new.css */
		--radius-xs: 0.75rem;
	}

	.long-short-table {
		min-height: 60rem;
		margin-inline: var(--margin-inline, 0);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--ls-ui-md);
		overflow-x: auto;
		--cell-padding: 0.625rem;

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--ls-ui-sm);
			--cell-padding: 0.5rem;

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
			display: grid;
			width: 100%;
			margin-bottom: 1rem;
			border-bottom: 2px solid hsl(var(--hsl-text-ultra-light));
			text-align: left;
			white-space: nowrap;

			/* This makes the whole table one giant grid */
			:is(thead, tbody, tr) {
				display: contents;
			}

			th {
				padding: 1em var(--cell-padding);
				border-bottom: 2px solid hsl(var(--hsl-text-ultra-light));
				color: hsl(var(--hsl-text-extra-light));
			}

			td {
				padding: var(--cell-padding);

				&.name {
					font-weight: 500;
					color: hsl(var(--hsl-text-light));
				}

				&.no-match {
					color: hsl(var(--hsl-text-extra-light));
				}
			}

			/* Desktop/tablet: traditional table layout; zebra-striped rows */
			@media (--viewport-sm-up) {
				grid-template-columns: minmax(max-content, 5fr) repeat(3, 2fr);

				:is(th, td.name) {
					font-size: 0.875em;
				}

				tr:nth-child(even) td {
					background: hsl(var(--hsla-box-2));
				}
			}

			/* Mobile: nested row layout; border-separated rows */
			@media (--viewport-xs) {
				grid-template-columns: repeat(3, 1fr);

				tr:not(:last-child) td:not(.name) {
					border-bottom: 1px solid hsl(var(--hsl-text-ultra-light));
				}

				th.name {
					display: none;
				}

				td {
					&.name {
						grid-column: 1 / -1;
						padding-inline: 0;
					}

					&:not(.name) {
						padding-top: 0;
					}
				}
			}
		}
	}
</style>
