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
		margin-bottom: 0.75rem;
	}

	.content {
		font: var(--f-h4-roman);
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
</style>
