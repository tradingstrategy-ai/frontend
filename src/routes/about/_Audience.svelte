<script lang="ts">
	import AudienceType from './_AudienceType.svelte';
</script>

<section class="container">
	<!--
	<div class="row">
		<div class="col text-center">
			<h2>Audience</h2>
			<p>The Trading Strategy protocol creates value for all participants within the DeFi ecosystem.</p>
		</div>
	</div>
	-->

	<div class="row">
		<AudienceType title="For traders and investors">
			<li>Access automated trading strategies created by skilled strategy developers</li>
			<li>
				Provides typically better yield than lending pools, with considerably less risk than buy-and-hold strategies
			</li>
			<li>Automated trading outperforms most non-professional investors</li>
			<li>24/7 automated trading to capture opportunities even when you sleep</li>
			<li>Easier to use compared to centralised exchange trading bot services, no API keys needed</li>
			<li>Direct trade execution on-chain without a counter-party risk</li>
		</AudienceType>

		<AudienceType title="For strategy developers">
			<li>Create and easily deploy trading algorithms for decentralised markets</li>
			<li>Access decentralised markets without needing technical knowledge of blockchains or smart contracts</li>
			<li>Easily backtest and optimise your strategies against huge datasets before launching it</li>
			<li>Access to focused investor base for your strategy</li>
			<li>Increase your portfolio by earning profit fees from strategies you have created</li>
			<li>Gain rewards based on your strategies performance</li>
			<li>Access to an expert community focused on algorithmic trading</li>
			<li>Choose to host on public open source or private strategies</li>
		</AudienceType>
	</div>
</section>

<style>
	p {
		font-size: 1.125rem;
	}
</style>
