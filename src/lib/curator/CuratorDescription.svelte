<!--
@component
About-the-curator widget for vault curator detail pages.

Shows the curator's short description, with the long description (markdown) and
external links (homepage, social, RSS) behind a "View more" control, matching
the vault protocol description widget. Sourced from the top-vaults dataset
`curators` map; recent posts are rendered separately by `CuratorRecentPosts`.

@example

```svelte
	<CuratorDescription curator={curatorInfo} />
```
-->
<script lang="ts">
	import type { CuratorInfo } from '$lib/top-vaults/schemas';
	import { slide } from 'svelte/transition';
	import { micromark } from 'micromark';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import IconTwitter from '~icons/local/twitter';
	import IconLinkedin from '~icons/local/linkedin';
	import IconRss from '~icons/local/rss';
	import IconHome from '~icons/local/home';

	interface Props {
		curator: CuratorInfo;
	}

	let { curator }: Props = $props();

	let expanded = $state(false);

	let links = $derived(
		[
			{ href: curator.website, label: 'Homepage', Icon: IconHome },
			{ href: curator.twitter, label: 'Twitter', Icon: IconTwitter },
			{ href: curator.linkedin, label: 'LinkedIn', Icon: IconLinkedin },
			{ href: curator.rss, label: 'RSS', Icon: IconRss }
		].filter((link) => link.href)
	);

	let hasExpandableContent = $derived(Boolean(curator.long_description) || links.length > 0);
</script>

<div class="curator-description">
	<MetricsBox title="About {curator.name}">
		{#if curator.short_description || hasExpandableContent}
			<div class="description-text">
				{#if curator.short_description}
					<p>{curator.short_description}</p>
				{/if}
				{#if hasExpandableContent}
					<Button ghost class="toggle-btn" on:click={() => (expanded = !expanded)}>
						{expanded ? 'View less' : 'View more'}
					</Button>
				{/if}
			</div>

			{#if expanded}
				<div transition:slide>
					{#if curator.long_description}
						<div class="long-description">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html micromark(curator.long_description)}
						</div>
					{/if}

					{#if links.length > 0}
						<div class="links">
							{#each links as { href, label, Icon } (label)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={href!} target="_blank" rel="noreferrer">
									<Icon --icon-size="1rem" />
									<span>{label}</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{:else}
			<p class="empty">No additional information available for this curator.</p>
		{/if}
	</MetricsBox>
</div>

<style>
	.curator-description {
		display: contents;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		.description-text {
			display: flex;
			flex-wrap: wrap;
			align-items: baseline;
			align-content: flex-start;
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
			margin-block: 1rem 1.5rem;

			:global(p) {
				margin-block: 1em;

				&:first-child {
					margin-top: 0;
				}

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
		}

		.links {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
			margin-top: 1rem;

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

		.empty {
			margin: 0;
			color: var(--c-text-extra-light);
			font: var(--f-ui-sm-roman);
		}
	}
</style>
