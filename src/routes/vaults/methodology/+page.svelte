<!--
How the DeFi vault rankings are made: data sources, APY and TVL definitions, default filters
and exclusions. Linked from every vault listing ("How we rank vaults").
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import { Section } from '$lib/components';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
</script>

<MetaTags
	titleParts={['How we rank DeFi vaults', 'APY, TVL and risk methodology']}
	description="How Trading Strategy ranks DeFi vaults: data sources, how APY and TVL are calculated, which vaults are hidden by default and what “best” means."
/>

<main class="methodology">
	<Section tag="header" padding="xs">
		<VaultListingsSelector />
	</Section>

	<Section tag="article" padding="sm" gap="sm">
		<h1>How we rank DeFi vaults</h1>
		<p class="lead">
			This page explains where the vault data comes from, how APY and TVL are calculated, which vaults are left out of
			the rankings by default, and how “best” is ordered on the
			<a href={resolve('/vaults')}>DeFi vault rankings</a> and on every chain, protocol, stablecoin and curator page.
		</p>

		<h2>Where the data comes from</h2>
		<ul>
			<li>
				Share prices, TVL and deposit status are collected by Trading Strategy from each vault’s smart contracts, or
				from the venue for perpetual DEX vaults such as Hyperliquid. The dataset is regenerated regularly; every listing
				shows when its data was last updated.
			</li>
			<li>Protocol, curator and stablecoin descriptions come from Trading Strategy’s vault metadata.</li>
			<li>
				Risk ratings from <a href={resolve('/vaults/core3-ratings')}>CORE3</a> and
				<a href={resolve('/vaults/xerberus-ratings')}>Xerberus</a> are shown as published by those providers.
			</li>
			<li>
				The full dataset is available for download on the <a href={resolve('/vaults/datasets')}>datasets page</a>.
			</li>
		</ul>

		<h2>How APY is calculated</h2>
		<p>
			APY on the listings is the vault’s return over the last 30 days, annualised on a 365.25-day year. It is the
			<strong>net</strong> return after the vault’s fees when the net figure is available, otherwise the gross share-price
			return. Vault pages also show returns over 1 week, 3 and 6 months, 1 year and the vault’s lifetime. Past returns are
			not an indication of future returns, and an annualised 30-day figure can move a lot from one month to the next.
		</p>

		<h2>How TVL is calculated</h2>
		<p>
			TVL is the vault’s current net asset value converted to US dollars with the exchange rate of its denomination
			token. Stablecoins pegged to other currencies, such as euro stablecoins, are converted at their own rate rather
			than counted as one dollar each. When a denomination token is not recognised and has no exchange rate, one token
			is counted as one dollar in listing totals.
		</p>

		<h2>Which vaults are listed</h2>
		<p>
			The rankings list stablecoin-denominated vaults only: vaults whose deposits and returns are in USD, euro or other
			stablecoins. Vaults denominated in ETH, BTC or other cryptocurrencies are not ranked, because their returns are
			not comparable with stablecoin yields.
		</p>

		<h2>Which vaults are hidden by default</h2>
		<ul>
			<li>
				Small vaults: the main listing shows vaults with at least $50,000 TVL (at least $1M for native Hyperliquid
				vaults); most chain, protocol, stablecoin and curator pages show vaults with at least $10,000 TVL.
			</li>
			<li>
				Blacklisted vaults, rated under the
				<a href={resolve('/blog/announcing-vault-technical-risk-framework-beta')}>vault technical risk framework</a>.
			</li>
			<li>AMM-like liquidity pools, except on protocol and strategy pages, which include them.</li>
		</ul>
		<p>Every one of these defaults can be changed with the listing filters.</p>

		<h2>What “best” means</h2>
		<p>
			Most listings order vaults by APY, highest first, after the filters above have been applied; curator pages order
			them by TVL. Every listing can also be sorted by TVL, by longer-period returns or by risk rating. Averages shown
			on a listing are weighted by TVL and leave out blacklisted vaults and APY figures above 1,000 %, which usually
			come from very young or very small vaults.
		</p>
		<p>
			The best vault per stablecoin on the
			<a href={resolve('/vaults/stablecoins')}>stablecoin yield comparison</a> is chosen more strictly than the listing tables:
			it must be a yield vault rather than a trading strategy or liquidity pool, be rated Low risk or safer, hold at least
			$100,000, have three months of history and show an APY no higher than 100 %. Figures above that usually come from trading
			vaults, liquidity pools or very young vaults and should not be read as a yield you can expect to earn.
		</p>
		<p>
			A ranking is a comparison of reported figures, not a recommendation. Check a vault’s risk ratings, fees, lock-up
			and deposit status on its page before depositing. Nothing on this site is investment advice.
		</p>
	</Section>
</main>

<style>
	.methodology {
		h1 {
			font: var(--f-h1-medium);
		}

		h2 {
			font: var(--f-h3-medium);
			margin-top: var(--space-lg);
		}

		.lead,
		p,
		li {
			font: var(--f-ui-lg-roman);
			max-width: 50rem;
		}

		ul {
			display: grid;
			gap: var(--space-sm);
			padding-left: var(--space-lg);
		}

		a {
			text-decoration: underline;
		}
	}
</style>
