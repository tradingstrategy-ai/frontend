<script lang="ts">
	import AudienceType from './_AudienceType.svelte';
	import DiscordIcon from './icons/discord.svg';
</script>

<section class="container">
	<div class="row">
		<div class="col text-center">
			<h2>Audience</h2>
			<p>The Trading Strategy protocol creates value for all participants within the DeFi ecosystem.</p>
		</div>
	</div>

	<div class="row">
		<AudienceType title="Traders and investors">
			<li>Access automated trading strategies created by skilled strategy developers and quants</li>
			<li>
				Provides typically better yield than lending pools, with considerably less risk than buy-and-hold strategies
			</li>
			<li>Automated trading outperforms most non-professional investors</li>
			<li>24/7 automated trading to capture opportunities even when you sleep</li>
			<li>Easier to use compared to centralised exchange trading bot services, no API keys needed</li>
			<li>Direct trade execution on-chain without a counter-party risk</li>

			<a slot="cta" class="btn-cta" href="https://newsletter.tradingstrategy.ai/" target="_blank">
				Sign up to waitlist
			</a>
		</AudienceType>

		<AudienceType title="Strategy developers and quants">
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

			<a slot="cta" class="btn-cta" href="https://discord.gg/en8tW6MDtw" target="_blank">
				Join our Discord server
				<img src={DiscordIcon} alt="discord" />
			</a>
		</AudienceType>
	</div>
</section>

<style>
	p {
		font-size: 1.125rem;
	}
</style>
