<script lang="ts">
	import { imageUrl } from '$lib/helpers/assets';
</script>

<section class="jumbotron jumbotron-fluid">
	<div>
		<h4 class="text-center">Our Partners</h4>

		<div class="partner-logos">
			<a href="https://www.avax.network/" target="_blank">
				<img src={imageUrl('partners/avalanche.svg')} alt="Avalanche" style="width: 208px; height: 43px;" />
			</a>

			<a href="https://typesense.org/" target="_blank">
				<img src={imageUrl('partners/typesense.svg')} alt="Typesense" style="width: 150px; height: 33px;" />
			</a>

			<a href="https://www.timescale.com/" target="_blank">
				<img src={imageUrl('partners/timescale.svg')} alt="Timescale" style="width: 170px; height:45px;" />
			</a>

			<a href="https://cosaic.io/chartiq/" target="_blank">
				<img src={imageUrl('partners/chartiq.svg')} alt="ChartIQ" style="width: 127px; height: 47px;" />
			</a>

			<a href="https://www.republiccapital.co/" target="_blank">
				<img
					src={imageUrl('partners/republic-capital.svg')}
					alt="Republic Capital"
					style="width: 60px; height: 60px;"
				/>
			</a>
		</div>
	</div>
</section>

<style>
	section {
		background-color: var(--c-parchment);
	}

	section > div {
		margin: 0 auto;
		max-width: 720px;
	}

	.partner-logos {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 4rem;
		margin-top: 5rem;
	}

	@media (max-width: 576px) {
		.partner-logos {
			flex-direction: column;
		}
	}
</style>
