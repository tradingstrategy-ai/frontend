<script lang="ts">
</script>

<svelte:head>
	<title>About Us</title>
	<meta name="description" content="About Trading Strategy Protocol" />
</svelte:head>

<main>
	<section>
		<div class="container">
			<div class="row hero">
				<div class="col text-center">
					<h1>
						Next generation<br />
						algorithmic trading protocol<br />
						for decentralised markets
					</h1>
					<p>
						Create or invest in algorithmic trading strategies on decentralised markets. The Trading Strategy protocol
						facilitates automated cryptocurrency trading built on a safe and secure framework.
					</p>
				</div>
			</div>

			<div class="row audience-heading">
				<div class="col text-center">
					<h2>Audience</h2>
					<p class="lead">
						The Trading Strategy protocol creates value for all participants within the DeFi ecosystem.
					</p>
				</div>
			</div>

			<div class="row">
				<div class="col-md d-flex">
					<div class="card border-ink">
						<div class="card-body pb-0">
							<h4 class="card-title">Traders and Investors</h4>

							<ul>
								<li>Access automated trading strategies created by skilled strategy developers</li>
								<li>
									Provides typically better yield than lending pools, with considerably less risk than buy-and-hold
									strategies
								</li>
								<li>Automated trading outperforms most non-professional investors</li>
								<li>24/7 automated trading to capture opportunities even when you sleep</li>
								<li>Easier to use compared to centralised exchange trading bot services, no API keys needed</li>
								<li>Direct trade execution on-chain without a counter-party risk</li>
							</ul>
						</div>

						<div class="card-footer pt-0">
							<a class="btn-cta" href="/about">Explore Strategies Now</a>
						</div>
					</div>
				</div>

				<div class="col-md d-flex">
					<div class="card border-ink">
						<div class="card-body">
							<h4 class="card-title">Strategy Developers</h4>

							<ul>
								<li>Create and easily deploy trading algorithms for decentralised markets</li>
								<li>
									Access decentralised markets without needing technical knowledge of blockchains or smart contracts
								</li>
								<li>Easily backtest and optimise your strategies against huge datasets before launching it</li>
								<li>Access to focused investor base for your strategy</li>
								<li>Increase your portfolio by earning profit fees from strategies you have created</li>
								<li>Gain rewards based on your strategies performance</li>
								<li>Access to an expert community focused on algorithmic trading</li>
								<li>Choose to host on public open source or private strategies</li>
							</ul>
						</div>

						<div class="card-footer">
							<a class="btn-cta" href="/about">Explore Strategies Now</a>
						</div>
					</div>
				</div>
			</div>

			<div class="row mt-5">
				<div class="col text-center">
					<h2>Next Section</h2>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto quo, eveniet ipsum suscipit delectus
						praesentium? Cupiditate veniam at possimus qui rem ut. Reprehenderit, dolorum! Doloribus itaque voluptatem
						provident cupiditate ducimus.
					</p>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	h1 {
		margin-bottom: 2rem;
	}

	.card {
		margin-top: 1rem;
	}

	.card-body {
		padding-bottom: 0;
	}

	.card-footer {
		padding-top: 0.5rem;;
	}

	.card ul {
		padding-left: inherit;
	}

	.card li {
		line-height: 1.2;
		margin-bottom: 1em;
	}

	.border-ink {
		border: 1px solid var(--c-ink);
		border-radius: 0;
	}

	.hero {
		margin: 2rem 0 5rem 0;
	}

	.hero p {
		margin: 0 auto;
		max-width: 600px;
	}

	.lead {
		font-size: 1.125rem;
	}

	.btn-cta {
		display: inline-block;
		padding: 0.75em 1.25em;
		background: var(--c-ink);
		color: var(--c-parchment);
		font-size: 0.8rem;
		font-weight: 500;
		text-align: center;
	}

	.btn-cta:hover {
		opacity: 0.8;
	}

	@media (max-width: 992px) {
		.btn-cta {
			display: block;
		}
	}
</style>
