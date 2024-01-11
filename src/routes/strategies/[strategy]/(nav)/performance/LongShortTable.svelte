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
	title="Performance summary"
	subtitle="Strategy performance metrics based on {isBacktested ? 'backtesting' : 'live trading'} data."
	ctaPosition="top"
>
	<!-- FIXME: overriding radius for now due to inconsistencies with radius.css and radius-new.css -->
	<TextInput
		slot="cta"
		bind:value={filter}
		size="md"
		type="search"
		placeholder="Filter metrics"
		--radius-xs="0.75rem"
	/>
	<div class="long-short-table">
		<table>
			<tr>
				<th class="name">Metric</th>
				{#each tableData.columns as column}
					<th class={column.toLowerCase()}>
						{column}
					</th>
				{/each}
			</tr>
			{#each filteredRows as row (row.kind)}
				<tr>
					<td class="name">{row.name}</td>
					{#each tableData.columns as column}
						{@const value = row.value[column]}
						<td class={column.toLowerCase()}>
							{#if isDurationField(row)}
								<span class="long-label">{value}</span>
								<span class="short-label">{durationShortLabel(value)}</span>
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
		</table>
	</div>
</SummaryBox>

<style lang="postcss">
	.long-short-table {
		min-height: 60rem;

		table {
			display: grid;
			width: 100%;
			margin-bottom: 1rem;
			border-bottom: 2px solid hsl(var(--hsl-text-ultra-light));
			white-space: nowrap;
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md);
			--cell-padding: 0.625rem;

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm);
				--cell-padding: 0.5rem;
			}

			/* Make all table cells part of a single grid */
			tr {
				display: contents;
			}

			th {
				position: sticky;
				top: -1px;
				padding: 1em var(--cell-padding);
				border-bottom: 2px solid hsl(var(--hsl-text-ultra-light));
				text-align: left;

				color: hsl(var(--hsl-text-extra-light));
				/* using color-mix to prevent layered transparency */
				background: color-mix(in srgb, hsl(var(--hsl-body)), hsl(var(--hsl-box)) 12%);
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

			/* Desktop: traditional table layout; zebra-striped rows */
			@media (--viewport-md-up) {
				grid-template-columns: minmax(max-content, 5fr) repeat(3, 2fr);

				.short-label {
					display: none;
				}

				tr:nth-child(odd) td {
					background: hsl(var(--hsla-box-2));
				}

				:is(th, td.name) {
					font-size: 0.875em;
				}

				:is(.all, .long, .short) {
					text-align: right;
				}
			}

			/* Mobile: nested row layout; border-separated rows */
			@media (--viewport-sm-down) {
				grid-template-columns: repeat(3, 1fr);

				.long-label {
					display: none;
				}

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
