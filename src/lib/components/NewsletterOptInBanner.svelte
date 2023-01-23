<script lang="ts">
	import SubscribeForm from './SubscribeForm.svelte';
</script>

<div class="newsletter-opt-in-banner">
	<div class="artwork">
		<slot name="artwork" />
	</div>

	<div class="form">
		<div class="content">
			<slot name="title">
				<h2>Sign up to newsletter</h2>
			</slot>
			<slot name="description">
				<p>Sign up to our newsletter</p>
			</slot>
		</div>
		<SubscribeForm />
	</div>
</div>

<style lang="postcss">
	.newsletter-opt-in-banner {
		display: grid;
		gap: var(--space-5xl);
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		place-items: center stretch;
		place-content: center;
	}

	.newsletter-opt-in-banner :global .subscribe-form {
		grid-template-columns: repeat(auto-fit, minmax(17rem, auto));
	}

	.newsletter-opt-in-banner .artwork {
		display: grid;
		place-items: center;

		@media (--viewport-md) {
			padding: 2rem;
		}

		& :global svg {
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

	.newsletter-opt-in-banner .form {
		display: grid;
		gap: var(--space-sm);
	}

	.newsletter-opt-in-banner :global [slot='title'],
	.newsletter-opt-in-banner h2 {
		margin-bottom: var(--space-lg);
	}

	.newsletter-opt-in-banner :global p {
		font: var(--f-ui-xl-roman);

		@media (--viewport-xs) {
			font: var(--f-ui-lg-roman);
			line-height: 1.5;
		}
	}
</style>
