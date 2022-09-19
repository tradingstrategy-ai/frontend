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
		align-items: center;
		row-gap: 1.5rem;
		padding-block: 1rem;
	}

	section h1 {
		margin-bottom: 0.75rem;
	}

	.content {
		font: var(--f-h4-roman);
	}

	.media {
		padding-inline: 2rem;
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
			grid-template-columns: 5fr 4fr;
			column-gap: 8vw;
			padding-block: 3.5rem;
		}

		.media {
			padding: 0;
		}

		.media :global svg {
			max-width: unset;
		}
	}

	@media (--viewport-lg-up) {
		.content {
			font: 500 var(--fs-heading-lg);
		}
	}
</style>
