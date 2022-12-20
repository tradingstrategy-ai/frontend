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
		row-gap: var(--space-lg);
		padding-block: var(--space-md);
	}

	section h1 {
		margin-bottom: var(--space-sl);
	}

	.content {
		font: var(--f-h4-roman);
	}

	.media {
		padding-inline: var(--space-xl);
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
			padding-block: var(--space-xxxxxxl);
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
			font: var(--f-heading-lg-roman);
		}
	}
</style>
