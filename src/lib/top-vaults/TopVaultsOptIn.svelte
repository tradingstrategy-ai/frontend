<script lang="ts">
	import Alert from '$lib/components/Alert.svelte';
	import SubscribeForm from '$lib/newsletter/SubscribeForm.svelte';
</script>

<div style:margin-top="1rem">
	<Alert size="md" status="info" title="Coming soon">
		Automated vault multistrategy coming soon. Subscribe here for our newsletter to be first to know.
		<div class="subscribe-form-wrapper">
			<SubscribeForm inputSize="md" buttonSize="sm" />
		</div>
	</Alert>
</div>

<style>
	.subscribe-form-wrapper {
		:global(.subscribe-form .fields) {
			max-width: 30rem;
			padding-block: 1rem 0;

			@media (--viewport-sm-up) {
				grid-template-columns: 1fr auto;
			}
		}

		:global(.captcha) {
			margin-top: 1rem;

			@media (--viewport-sm-up) {
				text-align: left;
			}
		}
	}
</style>
