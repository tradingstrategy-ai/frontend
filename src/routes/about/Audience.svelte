<script lang="ts">
	import { Button, Section, SummaryBox } from '$lib/components';
	import { toggleSubscribeDialog } from '$lib/newsletter/controller';
</script>

<div class="audience-wrapper">
	<Section class="audience ds-container" cols={2} layout="boxed" padding="xl">
		<header>
			<h2>Audience</h2>
			<p>The Trading Strategy protocol creates value for all participants within the DeFi ecosystem.</p>
		</header>
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

			<Button slot="footerCta" label="Sign up to waitlist" on:click={toggleSubscribeDialog} />
		</SummaryBox>

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
	.audience-wrapper {
		& :global .audience {
			--grid-gap: var(--space-xl);
			@media (--viewport-xs) {
				--grid-gap: var(--space-lg);
			}
		}

		& header {
			display: grid;
			gap: var(--space-lg);
			grid-column: 1/-1;
			place-items: center;

			& p {
				font: var(--f-ui-xl-roman);
			}
		}
	}
</style>
