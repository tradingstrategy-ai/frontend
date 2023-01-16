<script lang="ts">
	import { Section } from '$lib/components';
	import SubscribeForm from './SubscribeForm.svelte';
</script>

<Section
	class="banner"
	layout="boxed"
	title="Subscribe to our newsletter"
	padding="sm"
	subtitle="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
>
	<SubscribeForm />
</Section>

<style lang="postcss">
	:global .section {
		min-height: calc(100vh - var(--footer-height) - var(--header-height));
		display: grid;
		place-content: center;
	}
</style>
