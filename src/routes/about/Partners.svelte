<script lang="ts">
	import AvalancheImage from '$lib/assets/partners/avalanche.svg?raw';
	import BlizzardImage from '$lib/assets/partners/blizzard.svg?raw';
	import ChartIqImage from '$lib/assets/partners/chartiq.svg?raw';
	import InfinityVenturesImage from '$lib/assets/partners/infinity-ventures-crypto.svg?raw';
	import MenthaPartnersImage from '$lib/assets/partners/mentha-partners.svg?raw';
	import TypesenseImage from '$lib/assets/partners/typesense.svg?raw';
	import TimescaleImage from '$lib/assets/partners/timescale.svg?raw';
	import PetRockCapitalImage from '$lib/assets/partners/pet-rock-capital.svg?raw';
	import RepublicCapitalImage from '$lib/assets/partners/republic-capital.svg?raw';
</script>

<section class="ds-container">
	<h2>Our partners</h2>

	<div>
		<a href="https://www.avax.network/" target="_blank" style:width="208px">
			{@html AvalancheImage}
		</a>

		<a href="https://twitter.com/blizzardfund" target="_blank" style:width="180px">
			{@html BlizzardImage}
		</a>

		<a href="https://cosaic.io/chartiq/" target="_blank" style:width="160px">
			{@html ChartIqImage}
		</a>

		<a href="https://www.ivcrypto.io/" target="_blank" style:width="170px" style:opacity="0.9">
			{@html InfinityVenturesImage}
		</a>

		<a href="https://mentha.partners/" target="_blank" style:width="190px" style:opacity="0.8">
			{@html MenthaPartnersImage}
		</a>

		<a href="https://www.petrock.capital/" target="_blank" style:width="250px">
			{@html PetRockCapitalImage}
		</a>

		<a href="https://www.republiccapital.co/" target="_blank" style:width="85px">
			{@html RepublicCapitalImage}
		</a>

		<a href="https://www.timescale.com/" target="_blank" style:width="220px">
			{@html TimescaleImage}
		</a>

		<a href="https://typesense.org/" target="_blank" style:width="160px">
			{@html TypesenseImage}
		</a>
	</div>
</section>

<style>
	section {
		justify-content: center;
		gap: var(--space-7xl);
		padding-top: 6rem;
		padding-bottom: var(--space-7xl);
	}

	h2 {
		text-align: center;
	}

	div {
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		gap: var(--space-5xl) var(--space-7xl);
		justify-content: center;
		align-items: center;
	}

	a :global svg * {
		fill: currentcolor;
	}

	@media (--viewport-md-up) {
		section {
			padding-block: 10rem;
		}

		div {
			flex-flow: row wrap;
		}
	}
</style>
