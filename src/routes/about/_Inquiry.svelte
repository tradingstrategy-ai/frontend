<script lang="ts">
	export let title: string;
</script>

<section class="jumbotron jumbotron-fluid">
	<div>
		<h4 class="text-center">{title}</h4>
		<slot />
		<div class="cta-wrapper">
			<slot name="cta">
				<a class="btn-cta" href="mailto:info@tradingstrategy.ai">Contact Now</a>
			</slot>
		</div>
	</div>
</section>

<style>
	section {
		margin: 3rem 0;
		background-color: var(--c-parchment-dark);
	}

	h4 {
		margin-bottom: 2rem;
	}

	section > div {
		box-sizing: content-box;
		margin: 0 auto;
		padding: 0 2rem;
		max-width: var(--max-width, 960px);
	}

	.cta-wrapper {
		margin-top: 2rem;
		text-align: center;
	}
</style>
