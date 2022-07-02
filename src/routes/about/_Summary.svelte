<script lang="ts">
	import LaptopChartImage from './images/laptop-chart.png';
</script>

<section class="container">
	<div class="row">
		<div class="col-lg col-image">
			<img src={LaptopChartImage} alt="ETH-USDC charts" />
		</div>
		<div class="col-lg col-text">
			<p>
				Trading Strategy is a next generation quantitative finance protocol for algorithmic and technical trading of
				cryptocurrencies on decentralised exchanges (DEX).
			</p>
			<p>
				Decentralised automated trading strategies enable trading with smooth user experience, better discipline, and
				lower risk, as investors get direct access to high quality strategies and real-time control over their assets,
				without needing the technical knowhow or being bound by time inefficiencies of manually executing trading.
			</p>
			<p>
				As the first in the world, Trading Strategy unifies market connectivity, on-chain data, trading signals,
				backtesting, trade execution, fund management and rewards quantitative finance experts in a single
				permissionless protocol.
			</p>
		</div>
	</div>
</section>

<style>
	.col-image {
		display: flex;
		justify-content: center;
	}

	.col-image img {
		width: 95%;
		object-fit: contain;
	}

	.col-text p {
		font-size: 1.125rem;
		margin: 2rem 1rem;
		text-align: center;
	}

	@media (max-width: 992px) {
		.col-image img {
			max-width: 400px;
		}

		.col-text p {
			text-align: left;
		}
	}
</style>
