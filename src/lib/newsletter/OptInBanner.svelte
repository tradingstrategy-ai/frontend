<script lang="ts">
	import SubscribeForm from './SubscribeForm.svelte';

	type Props = {
		title?: string;
		description?: string;
	};

	let { title, description }: Props = $props();
</script>

<div class="newsletter-opt-in-banner">
	<h2>
		{#if title}
			{title}
		{:else}
			Want to learn more how to profit with algorithmic trading and DeFi?
		{/if}
	</h2>
	<p>
		{#if description}
			{description}
		{:else}
			Subscribe to Trading Strategy newsletter for updates on strategies, cryptocurrency market insights and trading
			opportunities.
		{/if}
	</p>
	<SubscribeForm />
</div>

<style>
	.newsletter-opt-in-banner {
		display: grid;
		gap: 1.625rem;
		padding: 2rem;
		place-items: center stretch;
		place-content: center;
		border-radius: var(--radius-lg);
		background-color: var(--c-box-2);

		@media (--viewport-lg-up) {
			margin: auto;
			max-width: 60rem;
			padding: 3rem 2.75rem;
		}

		h2 {
			margin-bottom: 0;
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

		p {
			margin-bottom: 0;
			font: var(--f-ui-xl-roman);

			@media (--viewport-xs) {
				font: var(--f-ui-lg-roman);
				line-height: 1.5;
			}
		}
	}
</style>
