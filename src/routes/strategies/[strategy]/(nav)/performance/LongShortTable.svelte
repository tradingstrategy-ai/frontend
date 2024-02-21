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
					<td class="name">
						{#if row.help_link}
							<a class="body-link" href={row.help_link} target="_blank">{row.name}</a>
						{:else}
							{row.name}
						{/if}
					</td>
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
			border-bottom: 2px solid var(--c-text-ultra-light);
			white-space: nowrap;
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md);

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm);
			}

			/* Make all table cells part of a single grid */
			tr {
				display: contents;
			}

			/* zebra-striped rows */
			tr:nth-child(odd) td {
				background: var(--c-box-2);
			}

			:is(th, td) {
				padding: 0.625rem;
			}

			th {
				position: sticky;
				top: -1px;
				padding-block: 1em;
				border-bottom: 2px solid var(--c-text-ultra-light);
				text-align: left;

				color: var(--c-text-extra-light);
				/* using color-mix to prevent layered transparency */
				background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-1-alpha));
			}

			td {
				&.name {
					font-weight: 500;
					color: var(--c-text-light);
				}

				&.no-match {
					color: var(--c-text-extra-light);
				}
			}

			:is(.all, .long, .short) {
				text-align: right;
			}

			/* Desktop: traditional table layout */
			@media (--viewport-md-up) {
				grid-template-columns: minmax(max-content, 5fr) repeat(3, 2fr);

				.short-label {
					display: none;
				}

				:is(th, td.name) {
					font-size: 0.875em;
				}
			}

			/* Mobile: nested row layout */
			@media (--viewport-sm-down) {
				grid-template-columns: repeat(3, 1fr);

				.long-label {
					display: none;
				}

				td {
					padding-inline: 0.375em;
				}

				/* hide metric name table header */
				th.name {
					display: none;
				}

				/* give metric name its own sub-row in table rows */
				td.name {
					grid-column: 1 / -1;

					&:not(.no-match) {
						padding-bottom: 0;
					}
				}
			}
		}
	}
</style>
