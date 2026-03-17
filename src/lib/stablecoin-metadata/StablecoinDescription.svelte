<!--
@component
Expandable description widget for stablecoin detail pages. Displays short description
with optional expandable long description and external links (homepage, Twitter, CoinGecko, DefiLlama).

@example
```svelte
  <StablecoinDescription metadata={stablecoinMetadata} />
```
-->
<script lang="ts">
	import { slide } from 'svelte/transition';
	import { micromark } from 'micromark';
	import type { StablecoinMetadata } from './schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import IconTwitter from '~icons/local/twitter';
	import IconArrowRightUp from '~icons/local/arrow-right-up';
	import IconExternalLink from '~icons/local/external-link';

	interface Props {
		metadata: StablecoinMetadata;
	}

	let { metadata }: Props = $props();

	let expanded = $state(false);

	let hasExpandableContent = $derived(
		metadata.long_description && metadata.long_description !== metadata.short_description
	);

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
		<div class="description-text">
			<p>{metadata.short_description}</p>
			{#if hasExpandableContent}
				<Button ghost class="toggle-btn" on:click={() => (expanded = !expanded)}>
					{expanded ? 'View less' : 'View more'}
				</Button>
			{/if}
		</div>

		{#if expanded}
			<div transition:slide>
				<div class="long-description">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html micromark(metadata.long_description!)}
				</div>

				{#if links.length > 0}
					<div class="links">
						{#each links as { href, label, Icon } (label)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a {href} target="_blank" rel="noreferrer">
								<Icon --icon-size="1rem" />
								<span>{label}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</MetricsBox>
</div>

<style>
	.stablecoin-description {
		display: contents;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		.description-text {
			display: flex;
			flex-wrap: wrap;
			align-items: baseline;
			gap: 1rem;

			p {
				margin: 0;
			}
		}

		:global(.toggle-btn) {
			color: var(--c-text-extra-light);

			&:hover {
				color: var(--c-text);
			}
		}

		.long-description {
			margin-bottom: 1.5rem;

			:global(p) {
				margin-block: 1em;

				&:last-child {
					margin-bottom: 0;
				}
			}

			:global(a) {
				color: var(--c-text);
				text-decoration: underline;
			}

			:global(ul),
			:global(ol) {
				margin: 0 0 1em;
				padding-left: 1.5em;
			}

			:global(li) {
				margin-bottom: 0.25em;
			}

			:global(strong) {
				font-weight: 600;
			}

			:global(code) {
				font-family: var(--ff-mono);
				background: var(--c-box-2);
				padding: 0.125em 0.25em;
				border-radius: var(--radius-xs);
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
