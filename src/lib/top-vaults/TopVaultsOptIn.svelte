<script lang="ts">
	import SubscribeForm from '$lib/newsletter/SubscribeForm.svelte';
	import { newsletterBannerDescription, newsletterBannerTitle } from '$lib/newsletter/copy';
</script>

<div class="top-vaults-opt-in">
	<h2 class="cta-title">{newsletterBannerTitle}</h2>
	<p class="cta-text">{newsletterBannerDescription}</p>
	<SubscribeForm inputSize="md" buttonSize="sm" />
</div>

<style>
	.top-vaults-opt-in {
		max-width: 900px;
		margin: 1rem auto 0;
		padding: var(--space-ml);
		background: var(--c-box-1);
		border: 2px solid var(--c-box-3);
		border-radius: var(--radius-sm);
		text-align: center;

		:global(.subscribe-form .fields) {
			max-width: 30rem;
			margin-inline: auto;
			padding-block: 1rem 0;

			@media (--viewport-sm-up) {
				grid-template-columns: 1fr auto;
			}
		}

		:global(.captcha) {
			margin-top: 1rem;
		}
	}

	.cta-title {
		margin-bottom: 0.5rem;
		font: var(--f-heading-sm-medium);
		letter-spacing: var(--f-heading-sm-spacing, normal);
		color: var(--c-text);
	}

	.cta-text {
		margin-bottom: 0;
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
		color: var(--c-text);
	}
</style>
