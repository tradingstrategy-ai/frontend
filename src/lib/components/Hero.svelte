<script lang="ts">
	export let title: string;
	export let image: string;
</script>

<section class="ds-container">
	<div class="text">
		<h1>{title}</h1>
		<div class="content">
			<slot />
		</div>
	</div>

	<div class="media">
		{@html image}
	</div>
</section>

<style>
	section {
		grid-template-columns: auto;
		gap: 0;
		padding-top: 1rem;
		padding-bottom: 1rem;
		align-items: center;
	}

	section h1 {
		font: var(--f-h2-medium);
		margin-bottom: 0.75rem;
	}

	.content {
		font: var(--f-h5-roman);
	}

	.media {
		padding: 2rem;
		display: flex;
		justify-content: center;
	}

	.media :global svg {
		width: 100%;
		max-width: 25rem;
	}

	.media :global svg * {
		fill: currentColor;
	}

	@media (--viewport-md-up) {
		section {
			grid-template-columns: 5fr 1fr 4fr;
			padding-top: 3.5rem;
			padding-bottom: 3.5rem;
		}

		.media {
			grid-column: 3;
			padding: 0;
		}

		.media :global svg {
			max-width: unset;
		}
	}

	@media (--viewport-lg-up) {
		section h1 {
			font: 600 var(--fs-heading-xxl);
		}

		.content {
			font: 500 var(--fs-heading-md);
		}
	}
</style>
