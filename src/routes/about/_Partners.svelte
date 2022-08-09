<script lang="ts">
	import AvalancheImage from '$lib/assets/partners/avalanche.svg?raw';
	import TypesenseImage from '$lib/assets/partners/typesense.svg?raw';
	import TimescaleImage from '$lib/assets/partners/timescale.svg?raw';
	import ChartIqImage from '$lib/assets/partners/chartiq.svg?raw';
	import RepublicCapitalImage from '$lib/assets/partners/republic-capital.svg?raw';
</script>

<section class="ds-container">
	<h2>Our partners</h2>

	<div>
		<a href="https://www.avax.network/" target="_blank" style:width="208px">
			{@html AvalancheImage}
		</a>

		<a href="https://typesense.org/" target="_blank" style:width="150px">
			{@html TypesenseImage}
		</a>

		<a href="https://www.timescale.com/" target="_blank" style:width="170px">
			{@html TimescaleImage}
		</a>

		<a href="https://cosaic.io/chartiq/" target="_blank" style:width="127px">
			{@html ChartIqImage}
		</a>

		<a href="https://www.republiccapital.co/" target="_blank" style:width="60px">
			{@html RepublicCapitalImage}
		</a>
	</div>
</section>

<style>
	section {
		grid-template-columns: auto;
		justify-content: center;
		gap: 4rem;
		padding-top: 2.5rem;
		padding-bottom: 2.5rem;
	}

	h2 {
		text-align: center;
	}

	div {
		max-width: 800px;
		display: flex;
		flex-direction: column;
		gap: 3rem 4rem;
		justify-content: center;
		align-items: center;
	}

	@media (--viewport-md-up) {
		section {
			gap: 5rem;
			padding-top: 5rem;
			padding-bottom: 5rem;
		}

		div {
			flex-flow: row wrap;
		}
	}
</style>
