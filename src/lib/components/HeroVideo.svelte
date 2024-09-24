<script lang="ts">
	export let youTubeId: string;
	export let title: string;
</script>

<section class="ds-container hero-video">
	<iframe src="https://www.youtube.com/embed/{youTubeId}" {title} frameborder="0" allowfullscreen />
</section>

<style>
	.hero-video {
		--container-max-width: 1020px;
		padding-block: var(--space-xxxl);
	}

	iframe {
		width: 100%;
		aspect-ratio: 16 / 9;
	}
</style>
