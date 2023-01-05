<script lang="ts">
	export let image: string;
	export let title: string;
	export let subtitle = '';
</script>

<div class="hero-banner">
	<div class="content">
		<h1>{@html title}</h1>
		<p>{@html subtitle}</p>
		<slot />
	</div>

	<div class="media">
		{@html image}
	</div>
</div>

<style lang="postcss">
	.hero-banner {
		display: grid;
		gap: var(--space-10xl);
		grid-template-columns: 1fr minmax(12rem, min(28vw, 32rem));
		height: 40vh;
		place-content: center;
		place-items: stretch;

		@media (--viewport-sm-down) {
			gap: var(--space-lg);
			grid-template-columns: 1fr;
		}
	}

	.hero-banner .content {
		display: grid;
		place-content: center stretch;

		& p {
			font: var(--f-ui-xl-roman);

			@media (--viewport-xs) {
				font: var(--f-ui-lg-roman);
			}
		}
	}

	.hero-banner .media :global svg {
		max-height: min(28rem, 64vw);
		@media (--viewport-xs) {
			margin: auto;
		}

		& * {
			fill: currentColor;
		}
	}
</style>
