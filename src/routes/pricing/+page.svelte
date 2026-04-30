<!--
Pricing page with Basic and Pro tier comparison
-->
<script lang="ts">
	import { Banner, Button, Section, SummaryBox } from '$lib/components';
	import { pricingCheckoutUrl } from '$lib/config';
	import IconCheckSquare from '~icons/local/check-square';
	import IconMail from '~icons/local/mail';
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

	<Section gap="md">
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
				</tbody>
			</table>
		</div>
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
</style>
