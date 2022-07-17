<script lang="ts">
	import { imageUrl } from '$lib/helpers/assets';

	export let title: string;
	export let image: string;
	export let ctaUrl: string | undefined = undefined;
	export let ctaTarget: string | undefined = undefined;

	const imageAsset = imageUrl(`/milano/${image}`);
</script>

<div class="row">
	<div class="col-md col-image">
		<img src={imageAsset} alt={title} />
	</div>

	<div class="col-md col-text">
		<h5>{title}</h5>
		<ul>
			<slot />
		</ul>
		{#if ctaUrl}
			<div class="cta"><a class="btn-cta" href={ctaUrl} target={ctaTarget}>See More</a></div>
		{/if}
	</div>
</div>

<style>
	.row {
		display: flex;
		margin-top: 4em;
	}

	.row:nth-child(even) {
		flex-direction: row-reverse;
	}

	.col-text {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.col-text > * {
		margin: 0 1rem;
	}

	.col-text h5 {
		margin-bottom: 1rem;
	}

	.col-image {
		display: flex;
		justify-content: center;
	}

	.col-image img {
		object-fit: scale-down;
		width: 65%;
		margin: 2rem 0;
	}

	@media (max-width: 768px) {
		.row {
			margin-top: 2rem;
		}
	}

	@media (max-width: 576px) {
		.col-text .cta {
			text-align: center;
		}

		.col-image img {
			width: 80%;
		}
	}
</style>
