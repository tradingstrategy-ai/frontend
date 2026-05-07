<!--
Pricing page with Basic and Pro tier comparison
-->
<script lang="ts">
	import { Banner, Button, Section, SummaryBox, Tooltip } from '$lib/components';
	import { pricingCheckoutUrl } from '$lib/config';
	import IconCheckSquare from '~icons/local/check-square';
	import IconMail from '~icons/local/mail';

	let { data } = $props();

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
			<SummaryBox title="Basic" subtitle="Free">
				<p class="tier-description">The best yield hunting website for degens</p>
			</SummaryBox>

			<div class="pro-tier">
				<SummaryBox title="Pro" subtitle="$199/month" ctaPosition="bottom">
					<p class="tier-description">DeFi data for fund managers and institutions</p>
					<div class="pro-cta" slot="cta">
						{#if pricingCheckoutUrl}
							<Button label="Subscribe" href={pricingCheckoutUrl} target="_blank" rel="noreferrer" />
						{/if}
						<Button label="Download" href="/trading-view/vaults/datasets" secondary />
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
						<th class="plan-col">Basic</th>
						<th class="plan-col">Pro</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Vault analytics website</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>1,000+ stablecoin vaults</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>20+ blockchains</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Lending protocols and perp DEXes</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>$25B+ profit tracked</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Daily updates</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Equity curves</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Portfolio metrics</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Community Discord</td>
						<td class="check"><IconCheckSquare /></td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Non-stablecoin vaults</td>
						<td class="dash">—</td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>API access</td>
						<td class="dash">—</td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Data research and notebook integration</td>
						<td class="dash">—</td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Historical data</td>
						<td class="dash">—</td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Backtesting framework</td>
						<td class="dash">—</td>
						<td class="check"><IconCheckSquare /></td>
					</tr>
					<tr>
						<td>Direct developer support</td>
						<td class="dash">—</td>
						<td class="check"><IconCheckSquare /></td>
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
						<td class="check"><IconCheckSquare /></td>
					</tr>
				</tbody>
			</table>
		</div>
	</Section>

	<Section padding="md" gap="md" maxWidth="md">
		<h2>Data and fields</h2>
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
	</Section>

	<Banner title="Ready to get started?" padding="md" gap="md">
		<p>
			Request early access to Trading Strategy Pro and unlock advanced vault analytics, API access, and dedicated
			developer support.
		</p>
		<Button slot="cta" label="Request early access" href="mailto:info@tradingstrategy.ai">
			<IconMail slot="icon" />
		</Button>
	</Banner>
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
	}

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: var(--c-box-1);
	}

	th,
	td {
		padding: var(--space-md) var(--space-lg);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
		border-bottom: 1px solid var(--c-box-2);
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
