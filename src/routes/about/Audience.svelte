<script lang="ts">
	import { Button, Section, SummaryBox } from '$lib/components';
</script>

<div class="audience">
	<Section
		cols={2}
		gap="xl"
		title="Audience"
		subtitle="The Trading Strategy protocol creates value for all participants within the DeFi ecosystem."
	>
		<SummaryBox title="Traders and investors">
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

			<div class="subscribe-cta" slot="footerCta">
				<Button href="/newsletter">Sign up to waitlist</Button>
			</div></SummaryBox
		>

		<SummaryBox title="Strategy developers and quants">
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

			<Button
				slot="footerCta"
				label="Join our Discord server"
				icon="discord"
				href="https://discord.gg/en8tW6MDtw"
				target="_blank"
			/>
		</SummaryBox>
	</Section>
</div>

<style lang="postcss">
	.audience {
		margin-block: var(--space-8xl);
		--section-padding-y: var(--space-md);

		@media (--viewport-md-down) {
			margin-block: var(--space-6xl);
		}
		@media (--viewport-sm-down) {
			margin-block: var(--space-xl);
		}

		& :global .subtitle {
			@media (--viewport-sm-down) {
				font: var(--f-ui-xl-roman);
				letter-spacing: var(--f-ui-xl-spacing);
				text-align: left;
			}
		}
	}
</style>
