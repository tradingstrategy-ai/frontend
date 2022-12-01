<script lang="ts">
	import type { PageData } from './$types';
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { Menu, MenuItem, PageHeading, SummaryBox, SummaryBoxItem } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	export let data: PageData;

	$: summary = data.summary;
	$: portfolioStats = getPortfolioLatestStats(data.state);
	$: lastValuationDate = fromUnixTime(portfolioStats?.calculated_at);
	$: totalProfit = portfolioStats?.unrealised_profit_usd + portfolioStats?.realised_profit_usd;
</script>

<Breadcrumbs labels={{ [summary.id]: summary.name }} />

<main class="ds-container">
	<PageHeading>
		<h1>{summary.name}</h1>
		<p class="subtitle">{summary.long_description}</p>
	</PageHeading>

	<nav>
		<Menu horizontal>
			<MenuItem label="Overview" targetUrl="/strategies/{summary.id}" active />
			<MenuItem label="Open positions" targetUrl="/strategy/{summary.id}/open-positions" />
		</Menu>
	</nav>

	<section>
		<SummaryBox title="Current">
			<SummaryBoxItem label="Value in trading positions" value={formatDollar(portfolioStats.total_equity)} />
			<SummaryBoxItem label="Cash" value={formatDollar(portfolioStats.free_cash)} />
			<SummaryBoxItem label="Last valuation">
				<time datetime={lastValuationDate.toISOString()} title={lastValuationDate.toISOString()}>
					{formatDistanceToNow(lastValuationDate, { addSuffix: true })}
				</time>
			</SummaryBoxItem>
		</SummaryBox>

		<SummaryBox title="Performance">
			<SummaryBoxItem
				label="Current profit"
				value={formatDollar(totalProfit)}
				valueClass={determinePriceChangeClass(totalProfit)}
			/>
			<SummaryBoxItem
				label="Unrealised profit"
				value={formatDollar(portfolioStats.unrealised_profit_usd)}
				valueClass={determinePriceChangeClass(portfolioStats.unrealised_profit_usd)}
			/>
			<SummaryBoxItem
				label="Realised profit"
				value={formatDollar(portfolioStats.realised_profit_usd)}
				valueClass={determinePriceChangeClass(portfolioStats.realised_profit_usd)}
			/>
		</SummaryBox>
	</section>
</main>

<style lang="postcss">
	.subtitle {
		font: var(--f-ui-md-medium);
	}

	nav {
		margin-block: 1.25rem 0.5rem;
		--menu-item-padding: 1rem;
		--menu-item-border-radius: var(--border-radius-md);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-active-color: var(--c-text);
	}

	section {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(auto-fit, minmax(16rem, auto));
		padding-top: 1.25rem;

		@media (--viewport-md-down) {
			gap: 1.5rem;
		}
	}
</style>
