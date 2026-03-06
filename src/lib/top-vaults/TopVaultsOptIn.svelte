<script lang="ts">
	import SubscribeForm from '$lib/newsletter/SubscribeForm.svelte';
</script>

<div class="top-vaults-opt-in">
	<p class="cta-text">Get notified about the best new vaults and DeFi news</p>
	<SubscribeForm inputSize="md" buttonSize="sm" />
</div>

<style>
	.top-vaults-opt-in {
		max-width: 600px;
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

	.cta-text {
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: var(--c-text);
	}
</style>
