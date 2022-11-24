<script lang="ts">
	import { Button } from '$lib/components';

	export let title: string;
	export let image: string;
	export let ctaUrl: string | undefined = undefined;
	export let ctaTarget: string | undefined = undefined;
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
		{#if ctaUrl}
			<div class="cta">
				<Button label="See more" href={ctaUrl} target={ctaTarget} />
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.feature {
		display: flex;
		flex-direction: column;
		gap: 2rem 5rem;

		@media (--viewport-lg-up) {
			flex-direction: row;

			&:nth-child(even) {
				flex-direction: row-reverse;
			}

			& > * {
				flex: 1;
			}
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.5rem;

		@media (--viewport-lg-up) {
			gap: 2rem;
		}

		& h3 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		& ul {
			display: grid;
			gap: 1.5rem;
		}

		& :global li {
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		& .cta {
			display: grid;

			@media (--viewport-md-up) {
				align-self: center;
			}

			@media (--viewport-lg-up) {
				align-self: start;
			}
		}
	}

	.media :global {
		display: flex;
		justify-content: center;

		& svg {
			width: 100%;
			max-width: 480px;

			@media (--viewport-lg-up) {
				width: 80%;
			}

			& .bg {
				fill: var(--c-body);
			}

			& :not(.bg) {
				fill: currentColor;
			}
		}
	}
</style>
