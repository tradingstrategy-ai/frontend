<!--
    @component

    Frontpage impressive numbers widget.

    For the API see impressive-numbers here https://tradingstrategy.ai/api/explorer/
-->
<script>
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	// Might be null if API down - we still render the frontpage gracefully
	export let numbers;
</script>

<div class="impressive-numbers">
	<p class="lead">
		<span class="pulse" />
		Market data and trading strategy framework for
		<a href="/trading-view/blockchains">{numbers.blockchains} blockchains</a>,
		<a href="/trading-view/exchanges">{formatAmount(numbers.exchanges)} decentralised exchanges</a>,
		<a href="/trading-view/trading-pairs">{formatAmount(numbers.pairs)} trading pairs</a> and
		<a href="/trading-view/binance/tokens">{formatAmount(numbers.tokens)} tokens</a> with
		<a href="/trading-view/trading-pairs">{formatDollar(numbers.liquidity)} liquidity</a>.
	</p>
</div>

<style>
	a {
		border-bottom: 2px solid var(--link-underline);
	}

	a:hover {
		color: var(--link-underline);
	}

	.lead {
		margin-top: 2rem;
		max-width: 950px;
	}

	.impressive-numbers {
	}

	.pulse {
		display: inline-block;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--price-up-green);
		cursor: pointer;
		box-shadow: 0 0 0 rgba(0, 0, 0, 0);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(219, 0, 0, 0.4);
			/* box-shadow: 0 0 0 0 var(--price-up-green); */
		}
		70% {
			box-shadow: 0 0 0 10px rgba(219, 0, 0, 0);
		}
		100% {
			-moz-box-shadow: 0 0 0 0 rgba(219, 0, 0, 0);
		}
	}
</style>
