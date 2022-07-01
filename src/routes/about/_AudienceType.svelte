<script lang="ts">
	export let title: string;
</script>

<div class="col-md d-flex">
	<div class="card">
		<div class="card-body">
			<h4 class="card-title">{title}</h4>
			<ul>
				<slot />
			</ul>
		</div>
		<div class="card-footer">
			<a class="btn-cta" href="/about">Explore Strategies Now</a>
		</div>
	</div>
</div>

<style>
	.card {
		border: 1px solid var(--c-ink);
		border-radius: 0;
		margin-top: 1rem;
	}

	.card-body {
		padding-bottom: 0;
	}

	.card-footer {
		padding-top: 0.5rem;
	}

	@media (max-width: 992px) {
		.btn-cta {
			width: 100%;
		}
	}
</style>
