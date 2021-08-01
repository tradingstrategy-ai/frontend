<script context="module">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a
	export async function load({ page, session, fetch, context }) {
		const url = `https://candlelightdinner.capitalgram.com/datasets`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					datasets: await res.json()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}

</script>


<svelte:head>
	<title>On-chain quantative finance datasets</title>
</svelte:head>

<div class="container">
	<section class="md-12">
		<div class="card">
			<div class="card-body">
				<h1>Datasets</h1>

				<p>
					The following blockchain trade and liquidity datasets are available for
					<a href="https://docs.capitalgram.com/">Capitalgram clients.</a> You can use them for
					cryptocurrency algorithmic trading, automated trading strategy research and execution.
				</p>

				<p>
					<a href="https://docs.capitalgram.com/">Getting started</a> - <a href="https://github.com/miohtama/capitalgram-onchain-dex-quant-data">Github</a>
				</p>


			</div>
		</div>
	</section>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}

	.card-body a {
	  color: #b68300;
	  text-decoration: none;
	  font-weight: bold;
	  transition: 0.3s;
	}

	.card-body a:hover {
	  text-decoration: underline;
	  color: #eeb302;
	}

</style>
