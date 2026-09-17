<script lang="ts">
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import heroImage from '$lib/assets/illustrations/working-together.svg?raw';
	import { HeroBanner, Section } from '$lib/components';
</script>

<MetaTags
	titleParts={['Trading Strategy DAO LLC']}
	description="Information for Trading Strategy DAO LLC members: governance, membership and legal documents."
/>

<main class="dao-page">
	<Section tag="header" padding="md">
		<HeroBanner
			image={heroImage}
			title="Trading Strategy DAO LLC"
			subtitle="This page will contain information for Trading Strategy DAO LLC members."
			hr
		>
			<div>
				<strong>Smart contract address:</strong>
				To be announced
			</div>
		</HeroBanner>
	</Section>
</main>
