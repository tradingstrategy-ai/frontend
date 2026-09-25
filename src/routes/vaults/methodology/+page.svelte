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

	<Section tag="article" padding="sm" gap="md">
		<h1>How we rank DeFi vaults</h1>
		<p class="lead">
			This page explains where the vault data comes from, how APY and TVL are calculated, which vaults are left out of
			the rankings by default, and how “best” is ordered on the
			<a href={resolve('/vaults')}>DeFi vault rankings</a> and on every chain, protocol, stablecoin and curator page.
		</p>

		<h2>Where the data comes from</h2>
		<ul>
			<li>
				Share prices, TVL and deposit status are read from each vault’s own smart contracts, or from the exchange API
				for perpetual DEX vaults such as Hyperliquid, by Trading Strategy’s open-source vault scanners. The dataset is
				regenerated regularly; every listing shows when its data was last updated.
			</li>
			<li>Protocol, curator and stablecoin descriptions are maintained by Trading Strategy.</li>
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
			return. Vault pages also show 1-week, 3-month, 6-month, 1-year and lifetime returns, both absolute and annualised. Past
			returns are not an indication of future returns, and an annualised 30-day figure can move a lot from one month to the
			next.
		</p>

		<h2>How TVL is calculated</h2>
		<p>
			TVL is the vault’s current net asset value converted to US dollars with the exchange rate of its denomination
			token. Stablecoins pegged to other currencies, such as euro stablecoins, are converted at their own rate rather
			than counted as one dollar each.
		</p>

		<h2>Which vaults are hidden by default</h2>
		<ul>
			<li>
				Small vaults: the main listing shows vaults with at least $50,000 TVL (at least $1M for native Hyperliquid
				vaults); chain, protocol, stablecoin and curator pages show vaults with at least $10,000 TVL.
			</li>
			<li>
				Blacklisted vaults, rated under the
				<a href={resolve('/blog/announcing-vault-technical-risk-framework-beta')}>vault technical risk framework</a>.
			</li>
			<li>AMM-like liquidity pools on the main listing; protocol and stablecoin pages include them.</li>
		</ul>
		<p>Every one of these defaults can be changed with the listing filters.</p>

		<h2>What “best” means</h2>
		<p>
			By default vaults are ordered by APY, highest first, after the filters above have been applied. Listings can also
			be sorted by TVL, by longer-period returns or by risk rating. Averages shown on a listing are weighted by TVL and
			leave out blacklisted vaults and APY figures above 1,000 %, which are almost always accounting artefacts of very
			young or very small vaults.
		</p>
		<p>
			The vaults named at the top of a listing, and the best vault per stablecoin on the
			<a href={resolve('/vaults/stablecoins')}>stablecoin yield comparison</a>, are chosen more strictly than the table:
			they must be yield vaults rather than trading strategies or liquidity pools, be rated Low risk or safer, hold at
			least $100,000, have three months of history and show an APY no higher than 100 %. Higher figures come from
			trading vaults, liquidity pools or very young vaults and are not a yield you can expect to earn.
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
			margin-top: var(--space-md);
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
