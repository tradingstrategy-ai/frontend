<!--
@component
About-the-curator widget for vault curator detail pages.

Shows the curator's external links (homepage, social, RSS) behind a "View more"
control, matching the vault protocol description widget. Links are sourced from
the top-vaults dataset `curators` map; recent posts are rendered separately by
`CuratorRecentPosts`.

@example

```svelte
	<CuratorDescription curator={curatorInfo} />
```
-->
<script lang="ts">
	import type { CuratorInfo } from '$lib/top-vaults/schemas';
	import { slide } from 'svelte/transition';
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
</script>

<div class="curator-description">
	<MetricsBox title="About {curator.name}">
		{#if links.length > 0}
			<Button ghost class="toggle-btn" on:click={() => (expanded = !expanded)}>
				{expanded ? 'View less' : 'View more'}
			</Button>

			{#if expanded}
				<div transition:slide>
					<div class="links">
						{#each links as { href, label, Icon } (label)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={href!} target="_blank" rel="noreferrer">
								<Icon --icon-size="1rem" />
								<span>{label}</span>
							</a>
						{/each}
					</div>
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

		:global(.toggle-btn) {
			color: var(--c-text-extra-light);

			&:hover {
				color: var(--c-text);
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
