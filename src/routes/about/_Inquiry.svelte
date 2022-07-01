<script lang="ts">
	export let title: string;
</script>

<section class="jumbotron jumbotron-fluid">
	<div>
		<h4 class="text-center">{title}</h4>
		<slot />
		<div class="cta-wrapper">
			<a class="btn-cta" href="/about">Contact Now</a>
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
		max-width: 740px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.cta-wrapper {
		margin-top: 2rem;
		text-align: center;
	}
</style>
