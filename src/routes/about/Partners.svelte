<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import AvalancheImage from '$lib/assets/partners/avalanche.svg?raw';
	import BlizzardImage from '$lib/assets/partners/blizzard.svg?raw';
	import TradingViewImage from '$lib/assets/partners/tradingview.svg?raw';
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

		<Tooltip>
			<a slot="trigger" href="https://www.tradingview.com/" target="_blank" style:width="220px">
				{@html TradingViewImage}
			</a>
			<svelte:fragment slot="popup">
				<p>TradingView Lightweight Charts™</p>
				<p>Copyright &copy; 2025 TradingView, Inc.</p>
				<p>
					<a href="https://www.tradingview.com/" target="_blank">https://www.tradingview.com/</a>
				</p>
			</svelte:fragment>
		</Tooltip>
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
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--f-heading-xl-spacing, normal);
		text-align: center;

		@media (--viewport-sm-down) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}

	div {
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		gap: var(--space-5xl) var(--space-7xl);
		justify-content: center;
		align-items: center;
	}

	a {
		display: inline-block;

		:global(svg *) {
			fill: currentcolor;
		}
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
