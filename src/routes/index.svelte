<script context="module" lang="ts">
	export const prerender = true;
	import splash from '../lib/assets/splash.jpg';
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
</script>

<svelte:head>
	<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>
	<meta name="description" content="On-chain systematic investing and trading">
</svelte:head>


<main style="background-image: url({splash});">>
	<div >
		<section class="card-home card-jumbo">
			<div class="container">
				<h1>Algorithmic trading strategy protocol</h1>
			</div>
		</section>
	</div>
</main>

<style>

	main {
		min-height: 100vw;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	.card-jumbo {
		background: transparent;
		box-shadow: none;
	}

	h1 {
		width: 100%;
		color: white;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
