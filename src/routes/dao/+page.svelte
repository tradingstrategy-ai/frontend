<script lang="ts">
	import heroImage from '$lib/assets/illustrations/working-together.svg?raw';
	import { HeroBanner, Section } from '$lib/components';
</script>

<svelte:head>
	<title>Trading Strategy DAO LLC</title>
	<meta name="description" content="Information for Trading Strategy DAO LLC members." />
</svelte:head>

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
