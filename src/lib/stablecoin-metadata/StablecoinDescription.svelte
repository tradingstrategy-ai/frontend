<!--
@component
Description widget for stablecoin detail pages. Displays metadata
description and external links (homepage, Twitter, CoinGecko, DefiLlama).

@example
```svelte
  <StablecoinDescription metadata={stablecoinMetadata} />
```
-->
<script lang="ts">
	import type { StablecoinMetadata } from './schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import IconTwitter from '~icons/local/twitter';
	import IconArrowRightUp from '~icons/local/arrow-right-up';
	import IconExternalLink from '~icons/local/external-link';

	interface Props {
		metadata: StablecoinMetadata;
	}

	let { metadata }: Props = $props();

	let links = $derived(
		[
			{ href: metadata.links.homepage, label: 'Homepage', Icon: IconArrowRightUp },
			{ href: metadata.links.twitter, label: 'Twitter', Icon: IconTwitter },
			{ href: metadata.links.coingecko, label: 'CoinGecko', Icon: IconExternalLink },
			{ href: metadata.links.defillama, label: 'DefiLlama', Icon: IconExternalLink }
		].filter((link) => link.href)
	);
</script>

<div class="stablecoin-description">
	<MetricsBox title="About {metadata.name}">
		<div class="content">
			<div class="description-text">
				<p>{metadata.description}</p>
			</div>

			{#if links.length > 0}
				<div class="links">
					{#each links as { href, label, Icon } (label)}
						<a {href} target="_blank" rel="noreferrer">
							<Icon --icon-size="1rem" />
							<span>{label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</MetricsBox>
</div>

<style>
	.stablecoin-description {
		display: contents;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		.content {
			display: grid;
			gap: 1rem;
		}

		.description-text {
			p {
				margin: 0;
			}
		}

		.links {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;

			a {
				display: inline-flex;
				align-items: center;
				gap: 0.5em;
				font: var(--f-ui-sm-medium);
				color: var(--c-text-extra-light);
				text-decoration: none;
				transition: color var(--time-sm);

				&:hover {
					color: var(--c-text);
				}
			}
		}
	}
</style>
