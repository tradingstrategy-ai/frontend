<script lang="ts">
	import { discordUrl } from '$lib/config';
	import { Button, Grid, Section, SummaryBox } from '$lib/components';
	import IconDiscord from '~icons/local/discord';
</script>

<div class="audience">
	<Section>
		<header>
			<h2>Audience</h2>
			<p>The Trading Strategy protocol creates value for all participants within the DeFi ecosystem.</p>
		</header>
		<Grid cols={2} gap="xl">
			<SummaryBox title="Traders and investors" ctaPosition="bottom">
				<ul>
					<li>Access automated trading strategies created by skilled strategy developers and quants</li>
					<li>
						Provides typically better yield than lending pools, with considerably less risk than buy-and-hold strategies
					</li>
					<li>Automated trading outperforms most non-professional investors</li>
					<li>24/7 automated trading to capture opportunities even when you sleep</li>
					<li>Easier to use compared to centralised exchange trading bot services, no API keys needed</li>
					<li>Direct trade execution on-chain without a counter-party risk</li>
				</ul>

				<Button slot="cta" label="Sign up to waitlist" href="/newsletter" />
			</SummaryBox>

			<SummaryBox title="Strategy developers and quants" ctaPosition="bottom">
				<ul>
					<li>Create and easily deploy trading algorithms for decentralised markets</li>
					<li>Access decentralised markets without needing technical knowledge of blockchains or smart contracts</li>
					<li>
						Easily backtest and optimise your strategies against huge datasets available in the familiar candle format
					</li>
					<li>Access to focused investor base for your strategy</li>
					<li>
						Increase your portfolio by earning profit share and performance rewards from strategies you have created
					</li>
					<li>Gain rewards based on your strategies performance</li>
					<li>Access to an expert community focused on algorithmic trading</li>
					<li>Public open source or private strategies enabled</li>
				</ul>

				<Button slot="cta" label="Join our Discord server" href={discordUrl} target="_blank" rel="noreferrer">
					<IconDiscord slot="icon" />
				</Button>
			</SummaryBox>
		</Grid>
	</Section>
</div>

<style>
	.audience {
		--section-padding: var(--space-md);
		--section-gap: var(--space-md);
		margin-block: var(--space-8xl);

		@media (--viewport-md-down) {
			margin-block: var(--space-6xl);
		}
		@media (--viewport-sm-down) {
			margin-block: var(--space-xl);
		}
	}

	header {
		text-align: center;

		p {
			margin: 1rem 0;
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing);

			@media (--viewport-sm-down) {
				text-align: left;
			}
		}
	}

	li {
		margin-bottom: var(--space-md);
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);
	}
</style>
