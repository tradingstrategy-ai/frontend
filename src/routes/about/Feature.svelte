<script lang="ts">
	export let title: string;
	export let image: string;
</script>

<div class="feature">
	<div class="media">
		{@html image}
	</div>

	<div class="content">
		<h3>{title}</h3>
		<ul>
			<slot />
		</ul>
		{#if $$slots.cta}
			<div class="cta">
				<slot name="cta" />
			</div>
		{/if}
	</div>
</div>

<style>
	.feature {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl) 5rem;

		@media (--viewport-lg-up) {
			flex-direction: row;

			&:nth-child(even) {
				flex-direction: row-reverse;
			}

			> * {
				flex: 1;
			}
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-lg);

		@media (--viewport-lg-up) {
			gap: var(--space-xl);
		}

		h3 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		ul {
			display: grid;
			gap: var(--space-lg);
		}

		:global(li) {
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		.cta {
			display: grid;

			@media (--viewport-md-up) {
				align-self: center;
			}

			@media (--viewport-lg-up) {
				align-self: start;
			}
		}
	}

	.media {
		display: flex;
		justify-content: center;

		:global(svg) {
			width: 100%;
			max-width: 480px;

			@media (--viewport-lg-up) {
				width: 80%;
			}

			:global(*) {
				fill: currentColor;
			}

			:global(.bg) {
				fill: var(--c-body);
			}
		}
	}
</style>
