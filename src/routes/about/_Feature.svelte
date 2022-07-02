<script context="module" lang="ts">
	const imageAssets = import.meta.globEager('./images/*.svg');

	function getImageAsset(fileName: string) {
		for (const key of Object.keys(imageAssets)) {
			if (key.endsWith(fileName)) return imageAssets[key].default;
		}
	}
</script>

<script lang="ts">
	export let title: string;
	export let image: string;

	const imageAsset = getImageAsset(image);
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
		.col-image img {
			width: 80%;
		}
	}
</style>
