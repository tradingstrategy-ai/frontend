<script lang="ts">
	import { ContentListBox, Button } from '$lib/components';
	import { toggleSubscribeDialog } from '$lib/newsletter/controller';
</script>

<section class="ds-container">
	<header>
		<h2>Audience</h2>
		<p>The Trading Strategy protocol creates value for all participants within the DeFi ecosystem.</p>
	</header>

	<div class="ds-2-col">
		<ContentListBox title="Traders and investors">
			<li>Access automated trading strategies created by skilled strategy developers and quants</li>
			<li>
				Provides typically better yield than lending pools, with considerably less risk than buy-and-hold strategies
			</li>
			<li>Automated trading outperforms most non-professional investors</li>
			<li>24/7 automated trading to capture opportunities even when you sleep</li>
			<li>Easier to use compared to centralised exchange trading bot services, no API keys needed</li>
			<li>Direct trade execution on-chain without a counter-party risk</li>

			<svelte:fragment slot="cta">
				<Button label="Sign up to waitlist" on:click={toggleSubscribeDialog} />
			</svelte:fragment>
		</ContentListBox>

		<ContentListBox title="Strategy developers and quants">
			<li>Create and easily deploy trading algorithms for decentralised markets</li>
			<li>Access decentralised markets without needing technical knowledge of blockchains or smart contracts</li>
			<li>
				Easily backtest and optimise your strategies against huge datasets available in the familiar candle format
			</li>
			<li>Access to focused investor base for your strategy</li>
			<li>Increase your portfolio by earning profit share and performance rewards from strategies you have created</li>
			<li>Gain rewards based on your strategies performance</li>
			<li>Access to an expert community focused on algorithmic trading</li>
			<li>Public open source or private strategies enabled</li>

			<svelte:fragment slot="cta">
				<Button label="Join our Discord server" icon="discord" href="https://discord.gg/en8tW6MDtw" target="_blank" />
			</svelte:fragment>
		</ContentListBox>
	</div>
</section>

<style lang="postcss">
	section {
		gap: var(--space-lg);
		padding-block: 4rem;

		@media (--viewport-md-up) {
			padding-block: 5rem;
		}
	}

	header {
		display: grid;
		gap: var(--space-lg);
		margin-bottom: var(--space-lg);

		& h2 {
			text-align: center;
		}

		& p {
			font: var(--f-heading-sm-roman);
			letter-spacing: var(--f-heading-sm-spacing, normal);

			@media (--viewport-md-up) {
				text-align: center;
			}
		}
	}
</style>
