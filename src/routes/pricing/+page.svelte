<!--
Pricing page with Basic and Pro tier comparison
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Section, SummaryBox, Tooltip } from '$lib/components';
	import { pricingCheckoutUrl, creemCheckoutUrl } from '$lib/config';
	import IconCheck from '~icons/local/check-circle-gradient';

	let { data } = $props();

	onMount(() => {
		(window as any).Tawk_API = (window as any).Tawk_API || {};
		(window as any).Tawk_LoadStart = new Date();
		const s1 = document.createElement('script');
		const s0 = document.getElementsByTagName('script')[0];
		s1.async = true;
		s1.src = 'https://embed.tawk.to/6a01e4d9388ff41c35ff6f9d/1jobmbsib';
		s1.charset = 'UTF-8';
		s1.setAttribute('crossorigin', '*');
		s0.parentNode!.insertBefore(s1, s0);
	});

	const docsUrl = 'https://tradingstrategy.ai/docs/overview/defi-vault-data.html';

	const vaultMetadataFields = [
		'Name',
		'Vault Slug',
		'Protocol Slug',
		'Curator Slug',
		'Curator Name',
		'Protocol Curator',
		'Share Token Address',
		'Denomination Token Addr.',
		'Lifetime Return (Gross)',
		'Lifetime Return (Net)',
		'CAGR (Gross)',
		'CAGR (Net)',
		'3M Return (Gross)',
		'3M Return (Net)',
		'3M CAGR (Gross)',
		'3M CAGR (Net)',
		'3M Sharpe Ratio (Gross)',
		'3M Sharpe Ratio (Net)',
		'3M Volatility (Ann.)',
		'1M Return (Gross)',
		'1M Return (Net)',
		'1M CAGR (Gross)',
		'1M CAGR (Net)',
		'Denomination',
		'Normalised Denomination',
		'Denomination Slug',
		'Share Token',
		'Chain',
		'Peak TVL/NAV',
		'Current TVL/NAV',
		'Age (Years)',
		'Management Fee',
		'Performance Fee',
		'Deposit Fee',
		'Withdrawal Fee',
		'Fee Mode',
		'Fee Internalised',
		'Fee Label',
		'Lock-up (Estimated)',
		'Deposit/Withdraw Events',
		'Protocol',
		'Risk (Category)',
		'Risk (Numeric)',
		'Vault ID',
		'Start Date',
		'End Date',
		'Address',
		'Chain ID',
		'Stablecoin-Like',
		'First Updated At',
		'Last Updated At',
		'Last Share Price',
		'Detected Features',
		'Vault Flags',
		'Notes',
		'Trading Strategy Link',
		'Deposit Closed Reason',
		'Redemption Closed Reason',
		'Deposit Next Open',
		'Redemption Next Open',
		'Available Liquidity',
		'Utilisation',
		'Leader Fraction',
		'Leader Commission',
		'Follower Count',
		'Account PnL',
		'Cumulative Volume',
		'Description',
		'Short Description',
		'Protocol Extension Data',
		'Period Results'
	];

	const historicalReturnsFields = [
		'chain',
		'address',
		'block_number',
		'timestamp',
		'share_price',
		'total_assets',
		'total_supply',
		'performance_fee',
		'management_fee',
		'vault_poll_frequency',
		'id',
		'name',
		'event_count',
		'protocol',
		'returns_1h',
		'deposit_closed_reason',
		'written_at',
		'max_deposit',
		'max_redeem',
		'deposits_open',
		'redemption_open',
		'trading',
		'available_liquidity',
		'utilisation',
		'leader_fraction',
		'leader_commission',
		'follower_count',
		'account_pnl',
		'cumulative_volume',
		'daily_deposit_count',
		'daily_withdrawal_count',
		'daily_deposit_usd',
		'daily_withdrawal_usd'
	];
</script>

<svelte:head>
	<title>Vault data pricing</title>
	<meta
		name="description"
		content="Compare Trading Strategy pricing plans. Free Basic tier with 1000+ stablecoin vaults, or Pro at $199/month with API access and developer support."
	/>
</svelte:head>

<main>
	<Section padding="md" gap="sm">
		<header class="hero">
			<h1>Vault data pricing</h1>
			<p>The most comprehensive DeFi vault datasets and API</p>
		</header>
	</Section>

	<Section gap="md" maxWidth="md">
		<div class="tier-cards">
			<SummaryBox title="Free" subtitle="Free to access, no sign up needed">
				<p class="tier-description">All vault data accessible on the website</p>
			</SummaryBox>

			<div class="pro-tier">
				<SummaryBox title="Pro" subtitle="$199/month" ctaPosition="bottom">
					<p class="tier-description">DeFi data for fund managers and institutions</p>
					<div class="pro-cta" slot="cta">
						{#if pricingCheckoutUrl}
							<Button label="Subscribe" href={pricingCheckoutUrl} target="_blank" rel="noreferrer" />
						{/if}
						{#if creemCheckoutUrl}
							<Button label="Purchase license" href={creemCheckoutUrl} target="_blank" rel="noreferrer" secondary />
						{/if}
						<p class="sold-by">
							* The monthly subscription licence is sold by Market Software Ltd. After subscribing, you will receive an
							API key in email. <a
								href="/trading-view/vaults/datasets"
								style="text-decoration: underline; font-weight: bold;">Download datasets here</a
							>. For any questions, please use the on-page chat – we are happy to help you.
						</p>
					</div>
				</SummaryBox>
			</div>
		</div>
	</Section>

	<Section padding="md" gap="md" maxWidth="md">
		<h2>Feature comparison</h2>
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th class="feature-col">Feature</th>
						<th class="plan-col">Free</th>
						<th class="plan-col">Pro</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Vault analytics website</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>1,000+ stablecoin vaults</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>20+ blockchains</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Lending protocols and perp DEXes</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>$25B+ tracked TVL</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Daily updates</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Equity curves</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Portfolio metrics</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Community Discord</td>
						<td class="check"><IconCheck /></td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>
							<Tooltip>
								<span slot="trigger" class="underline">AI ready</span>
								<svelte:fragment slot="popup">
									Data is available as files, not API, which any AI agent can easily read
								</svelte:fragment>
							</Tooltip>
						</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Historical data</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Raw data files</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Backtesting framework</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Support</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>
							<Tooltip>
								<span slot="trigger" class="underline">BTC/ETH-denominated vaults</span>
								<svelte:fragment slot="popup">
									Ask for data for vaults that do not use stablecoins for deposits
								</svelte:fragment>
							</Tooltip>
						</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
					<tr>
						<td>Startup discounts available</td>
						<td class="dash">—</td>
						<td class="check"><IconCheck /></td>
					</tr>
				</tbody>
			</table>
		</div>
	</Section>

	<Section padding="md" gap="md" maxWidth="md">
		<h2>Data and fields</h2>
		<div class="data-fields-panel">
			<p class="data-lead">
				{#if data.stats}
					Vault metadata and historical returns for <strong>{data.stats.chains}</strong> blockchains,
					<strong>{data.stats.protocols}</strong> vault protocols and
					<strong>{data.stats.stablecoinVaults.toLocaleString()}</strong> stablecoin vaults
				{:else}
					Vault metadata and historical returns across blockchains, vault protocols and stablecoin vaults
				{/if}
			</p>

			<details class="fields-details">
				<summary>View details</summary>
				<div class="fields-body">
					<div class="fields-group">
						<h3>Vault metadata</h3>
						<p class="monospace">{vaultMetadataFields.join(', ')}</p>
					</div>
					<div class="fields-group">
						<h3>Historical returns</h3>
						<p class="monospace">{historicalReturnsFields.join(', ')}</p>
					</div>
					<a href={docsUrl} target="_blank" rel="noreferrer" class="docs-link">View full field documentation</a>
				</div>
			</details>
		</div>
	</Section>
</main>

<style>
	.hero {
		text-align: center;

		h1 {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-heading-lg-medium);
				letter-spacing: var(--f-heading-lg-spacing, normal);
			}
		}

		p {
			margin-top: var(--space-sm);
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
			color: var(--c-text-light);

			@media (--viewport-sm-down) {
				font: var(--f-ui-lg-roman);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}
	}

	.tier-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-xl);

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}

		:global(.summary-box) {
			height: 100%;
		}
	}

	.pro-tier {
		:global(.summary-box) {
			background: var(--c-box-2);
			border: 1px solid var(--c-box-4);
		}
	}

	.tier-description {
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: var(--c-text-light);
	}

	.pro-cta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		align-items: center;
	}

	.sold-by {
		width: 100%;
		font: var(--f-ui-xs-roman);
		letter-spacing: var(--f-ui-xs-spacing, normal);
		color: var(--c-text-light);
	}

	.table-wrapper {
		overflow: visible;
		background: hsl(var(--hsl-box) / 6%);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid hsl(var(--hsl-box) / 12%);
		border-radius: var(--radius-lg, 12px);
		box-shadow:
			0 4px 24px hsl(var(--hsl-box) / 6%),
			inset 0 1px 0 hsl(var(--hsl-box) / 10%);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: hsl(var(--hsl-box) / 8%);
	}

	th,
	td {
		padding: var(--space-md) var(--space-lg);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
		border-bottom: 1px solid hsl(var(--hsl-box) / 8%);
		text-align: left;

		@media (--viewport-sm-down) {
			padding: var(--space-sm) var(--space-md);
			font: var(--f-ui-sm-roman);
		}
	}

	th {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
		}
	}

	tbody tr {
		transition: background var(--time-sm, 0.15s) ease;

		&:hover {
			background: hsl(var(--hsl-box) / 8%);
		}

		&:last-child td {
			border-bottom: none;
		}
	}

	.feature-col {
		width: 60%;
	}

	.plan-col {
		text-align: center;
		width: 20%;
	}

	.check,
	.dash {
		text-align: center;
		--icon-size: 1.25em;
	}

	.dash {
		color: var(--c-text-ultra-light);
	}

	.data-fields-panel {
		background: hsl(var(--hsl-box) / 6%);
		border: 1px solid hsl(var(--hsl-box) / 12%);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.data-lead {
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: var(--c-text-light);
	}

	.fields-details {
		summary {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-light);
			cursor: pointer;
			width: fit-content;

			&:hover {
				color: var(--c-text);
			}
		}
	}

	.fields-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		margin-top: var(--space-lg);
	}

	.fields-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);

		h3 {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}

		p {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: var(--c-text-light);
		}

		.monospace {
			font-family: var(--font-monospace, monospace);
			font-size: 0.85em;
		}
	}

	.docs-link {
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--f-ui-sm-spacing, normal);
		color: var(--c-text-light);
		text-decoration: underline;

		&:hover {
			color: var(--c-text);
		}
	}
</style>
