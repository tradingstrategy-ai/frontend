<!--
Conversion-focused pricing page for professional DeFi vault market data.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Tooltip } from '$lib/components';
	import { formatDollar } from '$lib/helpers/formatters';
	import IconCheck from '~icons/local/check-circle-gradient';

	let { data } = $props();

	onMount(() => {
		const tawkApi = ((window as any).Tawk_API = (window as any).Tawk_API || {});
		(window as any).Tawk_LoadStart = new Date();

		if (typeof tawkApi.showWidget === 'function') {
			tawkApi.showWidget();
		} else {
			const s1 = document.createElement('script');
			const s0 = document.getElementsByTagName('script')[0];
			s1.async = true;
			s1.src = 'https://embed.tawk.to/6a01e4d9388ff41c35ff6f9d/1jobmbsib';
			s1.charset = 'UTF-8';
			s1.setAttribute('crossorigin', '*');
			s0.parentNode!.insertBefore(s1, s0);
		}

		return () => {
			const api = (window as any).Tawk_API;
			if (api && typeof api.hideWidget === 'function') api.hideWidget();
		};
	});

	const docsUrl = 'https://tradingstrategy.ai/docs/overview/defi-vault-data.html';
	const checkoutUrl = 'https://www.creem.io/payment/prod_53PolewYVyya9lOWDQME1k';

	const audiences = [
		{
			label: 'Capital allocators',
			title: 'Compare opportunities with defensible metrics',
			copy: 'Evaluate net returns, Sharpe, volatility, liquidity, fees, TVL, vault age and technical risk before allocating capital.'
		},
		{
			label: 'Quants and strategy teams',
			title: 'Move from research idea to backtest faster',
			copy: 'Build vault rotation, vault-of-vaults, stablecoin and cross-protocol strategies using clean historical files and Python tooling.'
		},
		{
			label: 'AI and data products',
			title: 'Power automated workflows with structured data',
			copy: 'Feed analytics, agents and production applications without scraping and maintaining dozens of protocol-specific pipelines.'
		}
	];

	const dataPoints = [
		'Net and gross performance',
		'Historical share prices and TVL',
		'Sharpe and volatility metrics',
		'Technical risk categories',
		'Fees and lock-up information',
		'Liquidity and utilisation',
		'Curator and protocol metadata',
		'Deposit and withdrawal status'
	];

	const comparison = [
		{ feature: 'Vault analytics website', free: true, pro: true },
		{ feature: 'Stablecoin vault coverage', free: true, pro: true },
		{ feature: 'Lending protocols, perpetual DEXes, other compatible protocols', free: true, pro: true },
		{
			feature: data.stats ? `${formatDollar(data.stats.trackedTvl, 1, 3)} tracked TVL` : 'Live tracked TVL coverage',
			free: true,
			pro: true
		},
		{ feature: 'Daily updates', free: true, pro: true },
		{ feature: 'Equity curves and portfolio metrics', free: true, pro: true },
		{ feature: 'Community Discord', free: true, pro: true },
		{ feature: 'DEX price data', free: true, pro: true, href: '/trading-view/backtesting' },
		{ feature: 'AI-ready historical data', free: false, pro: true },
		{ feature: 'Raw data files', free: false, pro: true },
		{ feature: 'Backtesting framework', free: false, pro: true },
		{ feature: 'Support', free: false, pro: true },
		{
			feature: 'BTC/ETH-denominated vaults',
			free: false,
			pro: true,
			note: 'Available on request for vaults that do not use stablecoins for deposits'
		},
		{ feature: 'Startup discounts available', free: false, pro: true }
	];

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
		'3M Sharpe Ratio (Gross)',
		'3M Sharpe Ratio (Net)',
		'3M Volatility (Ann.)',
		'Denomination',
		'Normalised Denomination',
		'Chain',
		'Peak TVL/NAV',
		'Current TVL/NAV',
		'Age (Years)',
		'Management Fee',
		'Performance Fee',
		'Deposit Fee',
		'Withdrawal Fee',
		'Lock-up (Estimated)',
		'Protocol',
		'Risk (Category)',
		'Risk (Numeric)',
		'Vault ID',
		'Start Date',
		'End Date',
		'Address',
		'Chain ID',
		'Stablecoin-Like',
		'Last Share Price',
		'Deposit Closed Reason',
		'Redemption Closed Reason',
		'Available Liquidity',
		'Utilisation',
		'Leader Commission',
		'Follower Count',
		'Account PnL',
		'Cumulative Volume',
		'Description',
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
	<title>DeFi vault market data pricing | Trading Strategy</title>
	<meta
		name="description"
		content="Normalised historical returns, TVL, liquidity, fees and risk metrics for DeFi vault research, backtesting and automated data workflows."
	/>
</svelte:head>

<main>
	<section class="hero-section">
		<div class="page-shell hero">
			<div class="hero-copy">
				<p class="eyebrow"><span></span>DeFi vault market data for professional research</p>
				<h1>Build better DeFi vault allocation strategies</h1>
				<p class="hero-lede">
					Normalised historical returns, TVL, liquidity, fees and risk metrics across lending protocols, RWA, LP
					strategy and perpetual DEX vaults — ready for Python research, backtesting and automated data workflows.
				</p>
				<div class="hero-actions">
					<Button label="Download free sample" href="/vaults/datasets" size="lg" secondary />
					{#if checkoutUrl}
						<Button
							label="Start Pro — $199/month"
							href={checkoutUrl}
							target="_blank"
							rel="noreferrer"
							size="lg"
							primaryHeroBanner
						/>
					{/if}
				</div>
				<p class="microcopy">
					<span>✓ No sign-up for the sample</span><span>✓ Same schema as Pro</span><span>✓ JSON + Parquet</span>
				</p>
			</div>

			<div class="data-preview" aria-label="Dataset schema preview">
				<div class="preview-top">
					<span class="preview-dots"><i></i><i></i><i></i></span><strong>vault-metadata.json</strong><em>Daily</em>
				</div>
				<div class="preview-body">
					<p><span>01</span><b>{'{'}</b></p>
					<p><span>02</span><i>&quot;protocol&quot;</i>: <mark>&quot;…&quot;</mark>,</p>
					<p><span>03</span><i>&quot;chain&quot;</i>: <mark>&quot;…&quot;</mark>,</p>
					<p><span>04</span><i>&quot;current_tvl&quot;</i>: <em>number</em>,</p>
					<p><span>05</span><i>&quot;return_3m_net&quot;</i>: <em>number</em>,</p>
					<p><span>06</span><i>&quot;sharpe_3m_net&quot;</i>: <em>number</em>,</p>
					<p><span>07</span><i>&quot;risk_category&quot;</i>: <mark>&quot;…&quot;</mark>,</p>
					<p><span>08</span><i>&quot;available_liquidity&quot;</i>: <em>number</em></p>
					<p><span>09</span><b>{'}'}</b></p>
				</div>
				<div class="preview-foot">
					<span><i></i>One normalised schema</span><span
						>{data.stats ? `${data.stats.chains} chains` : 'Live coverage'}</span
					>
				</div>
			</div>
		</div>
	</section>

	<section class="proof-section">
		<div class="page-shell proof-strip">
			<div>
				<strong>{data.stats ? data.stats.stablecoinVaults.toLocaleString() : '—'}</strong><span>Stablecoin vaults</span>
			</div>
			<div><strong>{data.stats ? data.stats.protocols : '—'}</strong><span>Vault protocols</span></div>
			<div><strong>{data.stats ? data.stats.chains : '—'}</strong><span>Blockchains</span></div>
			<div>
				<strong>{data.stats ? formatDollar(data.stats.trackedTvl, 1, 3) : '—'}</strong><span>Tracked TVL</span>
			</div>
			<p><i></i>Updated daily</p>
		</div>
	</section>

	<section class="content-section">
		<div class="page-shell">
			<header class="section-heading">
				<p class="eyebrow"><span></span>Built for professional decisions</p>
				<h2>Built for decisions, not just dashboards</h2>
				<p>
					Replace fragmented protocol integrations and inconsistent yield figures with one research-ready vault
					universe.
				</p>
			</header>
			<div class="audience-grid">
				{#each audiences as audience, index}
					<article>
						<div class="card-top"><span class="pill">{audience.label}</span><span>0{index + 1}</span></div>
						<h3>{audience.title}</h3>
						<p>{audience.copy}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="content-section">
		<div class="page-shell schema-panel">
			<div class="schema-copy">
				<p class="eyebrow"><span></span>One schema across the vault market</p>
				<h2>Research lending, RWA, LP and perpetual DEX vaults with the same workflow</h2>
				<p>
					Compare vaults across protocols and blockchains without manually cleaning identifiers, fee structures,
					historical returns or protocol-specific fields.
				</p>
				<ul>
					{#each dataPoints as point}<li><span>✓</span>{point}</li>{/each}
				</ul>
				<a class="text-link" href={docsUrl} target="_blank" rel="noreferrer">View full field documentation ↗</a>
			</div>
			<div class="code-card">
				<div class="code-title"><span>Real dataset formats</span><strong>Python-ready</strong></div>
				<pre><code
						><span># Load metadata and history</span>
<b>import</b> json
<b>import</b> pandas <b>as</b> pd

<b>with</b> open(<i>&quot;vault-metadata.json&quot;</i>) <b>as</b> file:
    metadata = json.load(file)

vaults = pd.DataFrame(metadata[<i>&quot;vaults&quot;</i>])
history = pd.read_parquet(
    <i>&quot;vault-historical.parquet&quot;</i>
)</code
					></pre>
				<div class="format-chips"><span>JSON</span><span>Parquet</span><span>Same schema in sample</span></div>
			</div>
		</div>
	</section>

	<section class="content-section" id="plans">
		<div class="page-shell">
			<header class="section-heading centred">
				<p class="eyebrow"><span></span>Choose your access</p>
				<h2>Inspect the schema free. Use the full dataset in Pro.</h2>
				<p>Start with the Ethereum sample, then move to complete historical coverage when your research is ready.</p>
			</header>
			<div class="price-grid">
				<article class="price-card">
					<div>
						<p class="plan-label">Free</p>
						<h3>$0</h3>
						<p class="plan-description">Explore live vault analytics and inspect the downloadable sample schema.</p>
					</div>
					<ul>
						<li><IconCheck />Vault analytics website</li>
						<li><IconCheck />Ethereum sample dataset</li>
						<li><IconCheck />JSON and Parquet formats</li>
						<li><IconCheck />No sign-up needed</li>
					</ul>
					<Button label="Download free sample" href="/vaults/datasets" size="lg" secondary />
				</article>
				<article class="price-card pro-card">
					<span class="recommended">For professional research</span>
					<div>
						<p class="plan-label">Pro</p>
						<h3>$199 <span>/ month</span></h3>
						<p class="plan-description">
							Full AI-ready vault datasets for fund managers, quants, institutions and data products.
						</p>
					</div>
					<ul>
						<li><IconCheck />Full vault metadata and history</li>
						<li>
							<IconCheck />{data.stats
								? `${data.stats.stablecoinVaults.toLocaleString()} stablecoin vaults`
								: 'Live stablecoin vault coverage'}
						</li>
						<li>
							<IconCheck />{data.stats
								? `${data.stats.protocols} protocols across ${data.stats.chains} chains`
								: 'Live protocol and blockchain coverage'}
						</li>
						<li><IconCheck />Daily updates</li>
						<li><IconCheck />Backtesting framework and support</li>
					</ul>
					{#if checkoutUrl}<Button
							label="Start Pro — $199/month"
							href={checkoutUrl}
							target="_blank"
							rel="noreferrer"
							size="lg"
							primaryHeroBanner
						/>{/if}
					<p class="seller-note">Monthly licence sold by Market Software Ltd. API key delivered by email.</p>
				</article>
			</div>
		</div>
	</section>

	<section class="content-section">
		<div class="page-shell">
			<header class="section-heading">
				<p class="eyebrow"><span></span>Plan comparison</p>
				<h2>What changes when you move to Pro</h2>
			</header>
			<div class="table-wrapper">
				<table>
					<thead><tr><th>Feature</th><th>Free</th><th>Pro</th></tr></thead>
					<tbody>
						{#each comparison as row}
							<tr>
								<td>
									{#if row.note}<Tooltip
											><span slot="trigger" class="underline">{row.feature}</span><span slot="popup">{row.note}</span
											></Tooltip
										>
									{:else if row.href}<a href={row.href}>{row.feature}</a>{:else}{row.feature}{/if}
								</td>
								<td class:dash={!row.free}
									>{#if row.free}<IconCheck />{:else}—{/if}</td
								>
								<td><IconCheck /></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<section class="content-section">
		<div class="page-shell faq-grid">
			<header class="section-heading">
				<p class="eyebrow"><span></span>Questions</p>
				<h2>Before you subscribe</h2>
			</header>
			<div class="faq-list">
				<details open>
					<summary>What do I receive with Pro?<span>+</span></summary>
					<p>
						Full vault metadata and historical returns datasets, including AI-ready raw files and access to the Trading
						Strategy backtesting framework. Current download formats are JSON and Parquet.
					</p>
				</details>
				<details>
					<summary>How often is the data updated?<span>+</span></summary>
					<p>The vault dataset is updated daily.</p>
				</details>
				<details>
					<summary>Can I inspect the schema before subscribing?<span>+</span></summary>
					<p>Yes. The free Ethereum sample uses the same schema as the full dataset and does not require sign-up.</p>
				</details>
				<details>
					<summary>How is the subscription delivered?<span>+</span></summary>
					<p>
						The monthly licence is sold by Market Software Ltd. After subscribing, the API key is sent by email and used
						on the dataset download page.
					</p>
				</details>
			</div>
		</div>
	</section>

	<section class="content-section data-fields-section">
		<div class="page-shell">
			<details class="fields-details">
				<summary>View all dataset fields <span>+</span></summary>
				<div class="fields-body">
					<div>
						<h3>Vault metadata</h3>
						<p>{vaultMetadataFields.join(', ')}</p>
					</div>
					<div>
						<h3>Historical returns</h3>
						<p>{historicalReturnsFields.join(', ')}</p>
					</div>
					<a class="text-link" href={docsUrl} target="_blank" rel="noreferrer">View full field documentation ↗</a>
				</div>
			</details>
		</div>
	</section>

	<section class="final-section">
		<div class="page-shell final-cta">
			<div>
				<p class="eyebrow"><span></span>Start with real data</p>
				<h2>Build your next vault strategy on one clean dataset</h2>
			</div>
			<div class="final-actions">
				{#if checkoutUrl}<Button
						label="Start Pro — $199/month"
						href={checkoutUrl}
						target="_blank"
						rel="noreferrer"
						size="lg"
						primaryHeroBanner
					/>{/if}<a href="/vaults/datasets">Or download the free sample ↓</a>
			</div>
		</div>
	</section>
</main>

<style>
	main {
		--glass-border: color-mix(in srgb, var(--c-text-light), transparent 72%);
		--glass-border-strong: color-mix(in srgb, var(--c-text-light), transparent 56%);
		--glass-highlight: color-mix(in srgb, var(--c-text), transparent 92%);
		--glass-fill: color-mix(in srgb, var(--c-body) 86%, var(--c-box-3));
		--glass-shadow: color-mix(in srgb, var(--c-text-inverted), transparent 72%);
		--glass-text-muted: color-mix(in srgb, var(--c-text) 78%, var(--c-text-light));
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(circle at 82% 7%, color-mix(in srgb, var(--c-text-light), transparent 96%) 0%, transparent 25rem),
			radial-gradient(circle at 12% 42%, color-mix(in srgb, var(--c-box-4), transparent 68%) 0%, transparent 34rem);
	}
	.page-shell {
		width: min(calc(100% - (var(--space-xl) * 2)), 86rem);
		margin-inline: auto;
	}
	.hero-section {
		padding-block: var(--space-10xl) var(--space-7xl);
	}
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.12fr) minmax(24rem, 0.88fr);
		gap: var(--space-7xl);
		align-items: center;
	}
	.eyebrow {
		margin: 0 0 var(--space-lg);
		display: flex;
		gap: var(--space-sm);
		align-items: center;
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
	}
	.eyebrow > span {
		width: 0.45rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--c-bullish);
		box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--c-bullish), transparent 88%);
	}
	h1 {
		max-width: 50rem;
		margin: 0;
		font: var(--f-heading-xxxl-medium);
		letter-spacing: var(--f-heading-xxxl-spacing, normal);
	}
	.hero-lede {
		max-width: 50rem;
		margin: var(--space-xl) 0 0;
		color: var(--c-text-light);
		font: var(--f-ui-xl-roman);
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-top: var(--space-xl);
	}
	.hero-actions :global(.button),
	.price-card :global(.button),
	.final-actions :global(.button) {
		border-color: var(--glass-border-strong);
		box-shadow:
			0 0.75rem 1.8rem color-mix(in srgb, var(--c-text-inverted), transparent 86%),
			inset 0 1px 0 var(--glass-highlight),
			inset 0 -1px 0 color-mix(in srgb, var(--c-text-inverted), transparent 84%);
		backdrop-filter: blur(1.4rem) saturate(1.15) contrast(1.08);
		-webkit-backdrop-filter: blur(1.4rem) saturate(1.15) contrast(1.08);
	}
	.microcopy {
		margin: var(--space-md) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm) var(--space-lg);
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-roman);
	}
	.data-preview,
	.code-card,
	.table-wrapper,
	.price-card,
	.audience-grid article,
	.schema-panel,
	.fields-details {
		position: relative;
		isolation: isolate;
		border: 1px solid var(--glass-border);
		background:
			linear-gradient(180deg, var(--glass-highlight) 0%, transparent 14%, transparent 100%),
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--c-box-3), transparent 44%) 0%,
				color-mix(in srgb, var(--c-box-1), transparent 58%) 52%,
				color-mix(in srgb, var(--c-box-2), transparent 46%) 100%
			),
			var(--glass-fill);
		box-shadow:
			0 1.25rem 3.5rem var(--glass-shadow),
			0 0.2rem 0.75rem color-mix(in srgb, var(--c-text-inverted), transparent 90%),
			inset 0 1px 0 var(--glass-highlight),
			inset 1px 0 0 color-mix(in srgb, var(--c-text-light), transparent 94%),
			inset 0 -1px 0 color-mix(in srgb, var(--c-text-inverted), transparent 80%);
		backdrop-filter: blur(1.7rem) saturate(1.16) contrast(1.1);
		-webkit-backdrop-filter: blur(1.7rem) saturate(1.16) contrast(1.1);
	}
	.data-preview::before,
	.code-card::before,
	.table-wrapper::before,
	.price-card::before,
	.audience-grid article::before,
	.schema-panel::before,
	.fields-details::before,
	.final-cta::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: 0;
		border-radius: inherit;
		background:
			radial-gradient(circle at 9% -8%, color-mix(in srgb, var(--c-text), transparent 88%) 0%, transparent 28%),
			linear-gradient(115deg, color-mix(in srgb, var(--c-text-light), transparent 97%) 0%, transparent 30%);
		pointer-events: none;
	}
	.data-preview {
		overflow: hidden;
		border-radius: var(--radius-lg);
		transform: perspective(80rem) rotateY(-2deg) translateZ(0);
		transform-origin: left center;
		transition:
			transform var(--time-md) ease-out,
			border-color var(--time-md) ease-out,
			box-shadow var(--time-md) ease-out;
	}
	.data-preview:hover {
		transform: perspective(80rem) rotateY(0deg) translateY(-0.2rem);
		border-color: var(--glass-border-strong);
		box-shadow:
			0 1.8rem 4.5rem color-mix(in srgb, var(--c-text-inverted), transparent 72%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 80%);
	}
	.preview-top,
	.preview-foot {
		min-height: 3.25rem;
		padding-inline: var(--space-md);
		display: grid;
		align-items: center;
		border-color: var(--c-box-3);
		color: var(--glass-text-muted);
		font: var(--f-ui-xs-roman);
	}
	.preview-top {
		grid-template-columns: 1fr auto 1fr;
		border-bottom: 1px solid var(--glass-border);
		background: color-mix(in srgb, var(--c-body) 82%, var(--c-box-3));
		backdrop-filter: blur(1rem) saturate(1.12) contrast(1.08);
		-webkit-backdrop-filter: blur(1rem) saturate(1.12) contrast(1.08);
	}
	.preview-top strong {
		color: var(--c-text-light);
		font-weight: 400;
	}
	.preview-top em {
		justify-self: end;
		color: var(--c-bullish);
		font-style: normal;
	}
	.preview-dots {
		display: flex;
		gap: 0.35rem;
	}
	.preview-dots i {
		width: 0.5rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--c-bullish);
	}
	.preview-dots i:nth-child(2) {
		background: var(--c-warning);
	}
	.preview-dots i:nth-child(3) {
		background: var(--c-bearish);
	}
	.preview-body {
		padding: var(--space-lg);
		font: var(--f-mono-sm-roman);
		overflow: auto;
	}
	.preview-body p {
		margin: 0;
		white-space: nowrap;
	}
	.preview-body p > span {
		display: inline-block;
		width: 2.25rem;
		color: var(--c-text-ultra-light);
	}
	.preview-body i {
		color: color-mix(in srgb, var(--c-text), var(--c-bullish) 34%);
		font-style: normal;
	}
	.preview-body em {
		color: var(--c-warning);
		font-style: normal;
	}
	.preview-body mark {
		padding: 0;
		background: transparent;
		color: var(--c-text-light);
	}
	.preview-foot {
		grid-template-columns: 1fr auto;
		border-top: 1px solid var(--glass-border);
		background: color-mix(in srgb, var(--c-body) 86%, var(--c-box-2));
	}
	.preview-foot > span:first-child {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}
	.preview-foot i {
		width: 0.4rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--c-bullish);
	}
	.proof-section {
		border-block: 1px solid var(--glass-border);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c-text), transparent 98.5%), transparent 42%),
			color-mix(in srgb, var(--c-body) 90%, var(--c-box-2));
		box-shadow:
			0 1rem 3rem color-mix(in srgb, var(--c-text-inverted), transparent 90%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 94%);
		backdrop-filter: blur(1.6rem) saturate(1.12) contrast(1.08);
		-webkit-backdrop-filter: blur(1.6rem) saturate(1.12) contrast(1.08);
	}
	.proof-strip {
		display: grid;
		grid-template-columns: repeat(4, 1fr) auto;
	}
	.proof-strip > div {
		padding: var(--space-xl) var(--space-lg);
		border-right: 1px solid var(--glass-border);
	}
	.proof-strip > div:first-child {
		padding-left: 0;
	}
	.proof-strip strong {
		display: block;
		font: var(--f-heading-lg-medium);
	}
	.proof-strip span {
		display: block;
		margin-top: var(--space-xs);
		color: var(--glass-text-muted);
		font: var(--f-ui-sm-roman);
	}
	.proof-strip > p {
		margin: 0;
		padding-left: var(--space-lg);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--glass-text-muted);
		font: var(--f-ui-xs-roman);
	}
	.proof-strip > p i {
		width: 0.45rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--c-bullish);
	}
	.content-section {
		padding-top: var(--space-10xl);
	}
	.section-heading {
		max-width: 51rem;
	}
	.section-heading h2,
	.schema-copy h2,
	.final-cta h2 {
		margin: 0;
		font: var(--f-heading-xxl-medium);
		letter-spacing: var(--f-heading-xxl-spacing, normal);
	}
	.section-heading > p:last-child,
	.schema-copy > p {
		margin: var(--space-lg) 0 0;
		color: var(--c-text-light);
		font: var(--f-ui-lg-roman);
	}
	.audience-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
		margin-top: var(--space-3xl);
		border: 0;
		background: transparent;
	}
	.audience-grid article {
		min-height: 20rem;
		padding: var(--space-xl);
		border-radius: var(--radius-sm);
		display: flex;
		flex-direction: column;
		transition:
			transform var(--time-md) ease-out,
			border-color var(--time-md) ease-out,
			box-shadow var(--time-md) ease-out;
	}
	.audience-grid article:hover {
		transform: translateY(-0.35rem) scale(1.008);
		border-color: var(--glass-border-strong);
		box-shadow:
			0 1.75rem 4rem color-mix(in srgb, var(--c-text-inverted), transparent 76%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 80%);
	}
	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--c-text-ultra-light);
		font: var(--f-ui-xs-roman);
	}
	.pill {
		padding: var(--space-xs) var(--space-sm);
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--c-text-light), transparent 86%);
		background: color-mix(in srgb, var(--c-body), transparent 18%);
		color: var(--c-text);
		font: var(--f-ui-md-medium);
		box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 95%);
		backdrop-filter: blur(0.8rem) saturate(1.12) contrast(1.08);
	}
	.audience-grid h3 {
		margin: auto 0 0;
		font: var(--f-heading-md-medium);
	}
	.audience-grid article > p {
		margin: var(--space-md) 0 0;
		color: var(--c-text-light);
		font: var(--f-ui-md-roman);
	}
	.schema-panel {
		padding: var(--space-7xl);
		border-radius: var(--radius-lg);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-7xl);
		align-items: center;
		overflow: hidden;
	}
	.schema-copy ul {
		margin: var(--space-xl) 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-sm) var(--space-lg);
	}
	.schema-copy li {
		display: flex;
		gap: var(--space-sm);
		color: var(--c-text-light);
		font: var(--f-ui-sm-roman);
	}
	.schema-copy li span {
		color: var(--c-bullish);
	}
	.text-link {
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.code-card {
		overflow: hidden;
		border-radius: var(--radius-sm);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c-text), transparent 98%), transparent 18%),
			color-mix(in srgb, var(--c-body) 82%, var(--c-box-2));
		box-shadow:
			0 1.4rem 3.4rem color-mix(in srgb, var(--c-text-inverted), transparent 78%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 88%);
	}
	.code-title {
		min-height: 3.5rem;
		padding-inline: var(--space-md);
		border-bottom: 1px solid var(--c-box-3);
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--glass-text-muted);
		font: var(--f-ui-xs-roman);
	}
	.code-title strong {
		color: var(--c-bullish);
		font-weight: 400;
	}
	.code-card pre {
		margin: 0;
		padding: var(--space-lg);
		overflow: auto;
		color: var(--c-text-light);
		font: var(--f-mono-sm-roman);
	}
	.code-card code > span {
		color: var(--c-text-ultra-light);
	}
	.code-card code b {
		color: var(--c-text);
		font-weight: 500;
	}
	.code-card code i {
		color: color-mix(in srgb, var(--c-text-light), var(--c-bullish) 26%);
		font-style: normal;
	}
	.format-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		padding: 0 var(--space-md) var(--space-md);
	}
	.format-chips span {
		padding: var(--space-xxs) var(--space-sm);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-xxs);
		background: color-mix(in srgb, var(--c-box-2), transparent 45%);
		color: var(--glass-text-muted);
		font: var(--f-ui-xs-roman);
	}
	.centred {
		margin-inline: auto;
		text-align: center;
	}
	.centred .eyebrow {
		justify-content: center;
	}
	.centred > p:last-child {
		margin-inline: auto;
	}
	.price-grid {
		max-width: 62rem;
		margin: var(--space-3xl) auto 0;
		display: grid;
		grid-template-columns: 0.9fr 1.1fr;
		gap: var(--space-lg);
	}
	.price-card {
		position: relative;
		padding: var(--space-xl);
		border-radius: var(--radius-sm);
		display: flex;
		flex-direction: column;
		overflow: visible;
		transition:
			transform var(--time-md) ease-out,
			border-color var(--time-md) ease-out,
			box-shadow var(--time-md) ease-out;
	}
	.price-card:hover {
		transform: translateY(-0.3rem);
		border-color: var(--glass-border-strong);
		box-shadow:
			0 1.9rem 4.5rem color-mix(in srgb, var(--c-text-inverted), transparent 74%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 80%);
	}
	.pro-card {
		border-color: var(--glass-border-strong);
		background:
			linear-gradient(145deg, color-mix(in srgb, var(--c-text-light), transparent 97%), transparent 38%),
			color-mix(in srgb, var(--c-body) 78%, var(--c-box-3));
		box-shadow:
			0 1.8rem 4.5rem color-mix(in srgb, var(--c-text-inverted), transparent 76%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 80%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 92%);
	}
	.recommended {
		position: absolute;
		top: 0;
		right: var(--space-lg);
		transform: translateY(-50%);
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--c-box-4);
		border-radius: 999px;
		background: color-mix(in srgb, var(--c-body), transparent 12%);
		color: var(--c-text-light);
		font: var(--f-ui-xs-medium);
		box-shadow:
			0 0.75rem 1.8rem color-mix(in srgb, var(--c-text-inverted), transparent 72%),
			inset 0 1px 0 var(--glass-highlight);
		backdrop-filter: blur(1.4rem) saturate(1.12) contrast(1.08);
		-webkit-backdrop-filter: blur(1.4rem) saturate(1.12) contrast(1.08);
	}
	.plan-label {
		margin: 0;
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
	}
	.price-card h3 {
		margin: var(--space-sm) 0 0;
		font: var(--f-heading-xxl-medium);
	}
	.price-card h3 span {
		color: var(--glass-text-muted);
		font: var(--f-ui-md-roman);
	}
	.plan-description {
		min-height: 4.5rem;
		margin: var(--space-md) 0 0;
		color: var(--c-text-light);
		font: var(--f-ui-md-roman);
	}
	.price-card ul {
		margin: var(--space-xl) 0;
		padding: var(--space-xl) 0;
		border-top: 1px solid var(--c-box-3);
		list-style: none;
		display: grid;
		gap: var(--space-sm);
	}
	.price-card li {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--c-text-light);
		font: var(--f-ui-sm-roman);
		--icon-size: 1.15rem;
	}
	.price-card :global(.button) {
		width: 100%;
		margin-top: auto;
	}
	.seller-note {
		margin: var(--space-sm) 0 0;
		color: var(--glass-text-muted);
		text-align: center;
		font: var(--f-ui-xs-roman);
	}
	.table-wrapper {
		margin-top: var(--space-3xl);
		position: relative;
		overflow: hidden;
		border-radius: var(--radius-sm);
	}
	.table-wrapper table {
		width: 100%;
		border-collapse: collapse;
	}
	.table-wrapper thead {
		background: color-mix(in srgb, var(--c-body) 72%, var(--c-box-3));
		backdrop-filter: blur(1rem) saturate(1.12) contrast(1.08);
		-webkit-backdrop-filter: blur(1rem) saturate(1.12) contrast(1.08);
	}
	.table-wrapper th,
	.table-wrapper td {
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--c-box-2);
		font: var(--f-ui-md-roman);
		text-align: left;
	}
	.table-wrapper th {
		font: var(--f-ui-md-medium);
	}
	.table-wrapper th:nth-child(n + 2),
	.table-wrapper td:nth-child(n + 2) {
		width: 8rem;
		text-align: center;
		--icon-size: 1.2rem;
	}
	.table-wrapper tr:last-child td {
		border-bottom: 0;
	}
	.table-wrapper tbody tr {
		transition: background var(--time-sm) ease-out;
	}
	.table-wrapper tbody tr:hover {
		background: color-mix(in srgb, var(--c-text-light), transparent 96%);
	}
	.table-wrapper td.dash {
		color: var(--c-text-ultra-light);
	}
	.table-wrapper a,
	.underline {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.faq-grid {
		display: grid;
		grid-template-columns: 0.78fr 1.22fr;
		gap: var(--space-10xl);
	}
	.faq-list {
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-sm);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c-text), transparent 98.5%), transparent 16%),
			color-mix(in srgb, var(--c-body) 86%, var(--c-box-2));
		box-shadow:
			0 1.25rem 3.5rem color-mix(in srgb, var(--c-text-inverted), transparent 84%),
			inset 0 1px 0 var(--glass-highlight);
		backdrop-filter: blur(1.6rem) saturate(1.14) contrast(1.09);
		-webkit-backdrop-filter: blur(1.6rem) saturate(1.14) contrast(1.09);
	}
	.faq-list details {
		padding-inline: var(--space-lg);
		border-bottom: 1px solid var(--glass-border);
		transition: background var(--time-sm) ease-out;
	}
	.faq-list details:last-child {
		border-bottom: 0;
	}
	.faq-list details:hover,
	.faq-list details[open] {
		background: color-mix(in srgb, var(--c-text-light), transparent 96%);
	}
	.faq-list summary {
		min-height: 5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
		list-style: none;
		cursor: pointer;
		font: var(--f-ui-lg-roman);
	}
	.faq-list summary::-webkit-details-marker {
		display: none;
	}
	.faq-list summary span {
		color: var(--c-text-extra-light);
		font-size: 1.5rem;
		transition: transform var(--time-sm) ease;
	}
	.faq-list details[open] summary span {
		transform: rotate(45deg);
	}
	.faq-list details p {
		margin: calc(var(--space-sm) * -1) var(--space-7xl) var(--space-lg) 0;
		color: var(--c-text-light);
		font: var(--f-ui-md-roman);
	}
	.data-fields-section {
		padding-bottom: var(--space-10xl);
	}
	.fields-details {
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
	.fields-details > summary {
		min-height: 4.5rem;
		padding-inline: var(--space-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
		list-style: none;
		cursor: pointer;
		font: var(--f-ui-md-medium);
	}
	.fields-details summary::-webkit-details-marker {
		display: none;
	}
	.fields-body {
		padding: 0 var(--space-lg) var(--space-lg);
		display: grid;
		gap: var(--space-lg);
	}
	.fields-body h3 {
		margin: 0 0 var(--space-xs);
		font: var(--f-ui-md-medium);
	}
	.fields-body p {
		margin: 0;
		color: var(--c-text-light);
		font: var(--f-mono-xs-roman);
	}
	.final-section {
		padding-bottom: var(--space-10xl);
	}
	.final-cta {
		padding: var(--space-7xl);
		position: relative;
		isolation: isolate;
		overflow: hidden;
		border: 1px solid var(--glass-border-strong);
		border-radius: var(--radius-lg);
		background:
			radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--c-text), transparent 91%) 0%, transparent 30%),
			linear-gradient(135deg, color-mix(in srgb, var(--c-box-3), transparent 42%), transparent 58%),
			color-mix(in srgb, var(--c-body) 76%, var(--c-background-accent-1));
		box-shadow:
			0 2rem 5rem color-mix(in srgb, var(--c-text-inverted), transparent 72%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text), transparent 78%),
			inset 0 -1px 0 color-mix(in srgb, var(--c-text-inverted), transparent 76%);
		backdrop-filter: blur(2rem) saturate(1.16) contrast(1.1);
		-webkit-backdrop-filter: blur(2rem) saturate(1.16) contrast(1.1);
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-7xl);
	}
	.final-cta > div:first-child {
		max-width: 48rem;
	}
	.final-actions {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}
	.final-actions > a {
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
		text-decoration: underline;
	}

	@media (--viewport-lg-down) {
		.hero {
			grid-template-columns: 1fr;
		}
		.data-preview {
			max-width: 44rem;
		}
		.proof-strip {
			grid-template-columns: repeat(4, 1fr);
		}
		.proof-strip > p {
			grid-column: 1 / -1;
			padding: var(--space-md) 0;
		}
		.schema-panel {
			grid-template-columns: 1fr;
		}
		.audience-grid {
			grid-template-columns: 1fr 1fr;
		}
		.faq-grid {
			grid-template-columns: 1fr;
			gap: var(--space-3xl);
		}
	}
	@media (--viewport-md-down) {
		.page-shell {
			width: min(calc(100% - (var(--space-lg) * 2)), 86rem);
		}
		.hero-section {
			padding-block: var(--space-7xl);
		}
		.content-section {
			padding-top: var(--space-8xl);
		}
		.audience-grid {
			grid-template-columns: 1fr;
		}
		.schema-panel {
			padding: var(--space-xl);
		}
		.price-grid {
			grid-template-columns: 1fr;
			gap: var(--space-xl);
		}
		.plan-description {
			min-height: 0;
		}
		.final-cta {
			padding: var(--space-xl);
			flex-direction: column;
			align-items: stretch;
		}
		.final-actions {
			align-items: stretch;
		}
	}
	@media (--viewport-sm-down) {
		.page-shell {
			width: min(calc(100% - (var(--space-md) * 2)), 86rem);
		}
		h1 {
			font: var(--f-heading-xxl-medium);
		}
		.section-heading h2,
		.schema-copy h2,
		.final-cta h2 {
			font: var(--f-heading-xl-medium);
		}
		.hero-lede {
			font: var(--f-ui-lg-roman);
		}
		.hero-actions {
			display: grid;
		}
		.microcopy {
			display: grid;
		}
		.data-preview {
			transform: none;
		}
		.data-preview:hover {
			transform: translateY(-0.15rem);
		}
		.proof-strip {
			grid-template-columns: 1fr 1fr;
		}
		.proof-strip > div {
			padding: var(--space-lg) var(--space-md) var(--space-lg) 0;
		}
		.proof-strip > div:nth-child(even) {
			padding-left: var(--space-md);
			border-right: 0;
		}
		.schema-copy ul {
			grid-template-columns: 1fr;
		}
		.table-wrapper {
			overflow-x: auto;
		}
		.table-wrapper th,
		.table-wrapper td {
			padding: var(--space-sm) var(--space-md);
			font: var(--f-ui-sm-roman);
		}
		.table-wrapper th:nth-child(n + 2),
		.table-wrapper td:nth-child(n + 2) {
			width: 4rem;
		}
		.faq-list summary {
			font: var(--f-ui-md-roman);
		}
		.faq-list details p {
			margin-right: 0;
		}
		.fields-body p {
			font-size: 0.75rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.data-preview,
		.audience-grid article,
		.price-card,
		.faq-list details {
			transition: none;
		}
		.data-preview,
		.data-preview:hover,
		.audience-grid article:hover,
		.price-card:hover {
			transform: none;
		}
	}
</style>
