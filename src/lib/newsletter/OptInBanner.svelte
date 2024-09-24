<script lang="ts">
	import SubscribeForm from './SubscribeForm.svelte';

	let banner: HTMLElement;
	let form: SubscribeForm;

	export function scrollIntoView() {
		banner.scrollIntoView({ behavior: 'smooth' });
		form.focus({ preventScroll: true });
	}
</script>

<div bind:this={banner} class="newsletter-opt-in-banner">
	{#if $$slots.artwork}
		<div class="artwork">
			<slot name="artwork" />
		</div>
	{/if}
	<div class="form">
		<div class="content">
			<slot name="title">
				<h2>Do you want to become an expert on decentralised technology?</h2>
			</slot>
			<slot name="description">
				<p>
					Subscribe to Trading Strategy newsletter to find insights about DeFi markets and learn automated trading and
					blockchain development.
				</p>
			</slot>
		</div>
		<SubscribeForm bind:this={form} />
	</div>
</div>

<style>
	.newsletter-opt-in-banner {
		--newsletter-banner-padding: var(--space-xl);
		background-color: var(--c-box-2);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-8xl);
		grid-template-columns: repeat(auto-fit, minmax(min(20rem, calc(100vw - 10rem)), 1fr));
		padding: var(--newsletter-banner-padding);
		place-items: center stretch;
		place-content: center;

		@media (--viewport-lg-up) {
			--newsletter-banner-padding: var(--space-5xl) var(--space-4xl);
			margin: auto;
			max-width: 60rem;
		}

		:global .subscribe-form {
			grid-template-columns: repeat(auto-fit, minmax(17rem, auto));
		}

		.artwork {
			display: grid;
			place-items: center;

			@media (--viewport-md) {
				padding: 2rem;
			}

			:global svg {
				@media (--viewport-md-down) {
					max-width: min(36vw, 24rem);
					max-height: min(36vw, 24rem);
				}
				@media (--viewport-xs) {
					max-width: min(64vw, 16rem);
					max-height: min(64vw, 16rem);
				}
			}
		}

		.form {
			display: grid;
			gap: var(--space-sm);
		}

		:global [slot='title'],
		h2 {
			margin-bottom: var(--space-lg);
		}

		:global h2 {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}

			@media (--viewport-xs) {
				font: var(--f-heading-sm-medium);
				letter-spacing: var(--f-heading-sm-spacing, normal);
			}
		}

		:global p {
			font: var(--f-ui-xl-roman);

			@media (--viewport-xs) {
				font: var(--f-ui-lg-roman);
				line-height: 1.5;
			}
		}
	}
</style>
