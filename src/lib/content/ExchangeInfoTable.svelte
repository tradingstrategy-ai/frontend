<script>
	/**
	 * Render exchange summary table on exchange page.
	 */

	import { formatAmount, formatDollar, formatUnixTimestampAsMonth, formatUrlAsDomain } from '$lib/helpers/formatters';
	import { parseExchangeName } from '$lib/helpers/exchange';

	export let details;

	const nameDetails = parseExchangeName(details.human_readable_name);
</script>

<table class="table">
	<tr>
		<th>Name</th>
		<td>{nameDetails.name}</td>
	</tr>

	<tr>
		<th>Homepage</th>
		<td>
			{#if details.homepage}
				<a href={details.homepage}>
					{formatUrlAsDomain(details.homepage)}
				</a>
			{:else}
				Not available
			{/if}
		</td>
	</tr>

	<tr>
		<th>
			<a
				rel="external"
				href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html#volume-calculations"
			>
				Volume 30d
			</a>
		</th>
		<td>{formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}</td>
	</tr>

	<tr>
		<th>
			<a
				rel="external"
				href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html#volume-calculations"
			>
				Volume all-time
			</a>
		</th>
		<td>{formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}</td>
	</tr>

	<tr>
		<th>Trading pairs</th>
		<td>{formatAmount(details.pair_count)}</td>
	</tr>

	<tr>
		<th>
			<a rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html">
				Tracked trading pairs
			</a>
		</th>
		<td>{formatAmount(details.active_pair_count)}</td>
	</tr>

	{#if details.first_trade_at}
		<tr>
			<th>Launched</th>
			<td>
				{formatUnixTimestampAsMonth(details.first_trade_at)}
			</td>
		</tr>
	{/if}

	{#if nameDetails.version != 1}
		<tr>
			<th>Version</th>
			<td>{nameDetails.version}</td>
		</tr>
	{/if}

	<tr>
		<th>Type</th>
		<td>{details.exchange_type}</td>
	</tr>

	<tr>
		<th>Blockchain</th>
		<td>
			<a href="/trading-view/{details.chain_slug}">{details.chain_name}</a>
		</td>
	</tr>

	<tr>
		<th>
			<a rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/internal-id.html">
				Internal id
			</a>
		</th>
		<td>
			{details.exchange_id}
		</td>
	</tr>
</table>

<style>
	table {
		font-size: 1rem;
	}

	table td,
	table th {
		padding: 0.25rem;
		border: 0;
	}

	/* --breakpoint-md */
	@media (max-width: 992px) {
		/* On mobile, don't render headings too wide */
		table th,
		table td {
			border-bottom: 1px solid var(--c-border-1);
		}
	}

	a {
		font-weight: 500;
		border-bottom: 1px solid currentColor;
	}

	th a {
		font-weight: bold;
	}

	a:hover {
		color: var(--c-text-1);
	}
</style>
