<!--
@component
Widget displaying curator information on the vault detail page.

Shows the curator description and link to view all vaults managed by the
curator.

@example

```svelte
	<VaultCuratorInfo curator={curatorInfo} />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import type { CuratorInfo } from '$lib/top-vaults/schemas';

	interface Props {
		curator: CuratorInfo;
	}

	let { curator }: Props = $props();

	let curatorPageUrl = $derived(resolve(`/trading-view/vaults/curators/${curator.slug}`));
	let curatorLogoUrl = $derived(curator.logos.generic ?? curator.logos.light ?? curator.logos.dark);
</script>

<MetricsBox>
	<div class="curator-info">
		{#if curatorLogoUrl}
			<img src={curatorLogoUrl} alt={curator.name} class="curator-logo" />
		{/if}
		<div class="content">
			<h2>About {curator.name}</h2>
			<p class="description">
				This vault is curated by <a href={curatorPageUrl}>{curator.name}</a>.
			</p>
			{#if curator.short_description}
				<p class="description">{curator.short_description}</p>
			{/if}
		</div>
		<Button size="sm" class="view-all-btn" href={curatorPageUrl}>
			View all {curator.name} vaults
		</Button>
	</div>
</MetricsBox>

<style>
	.curator-info {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: center;

		&:has(.curator-logo) {
			grid-template-columns: auto 1fr auto;
		}

		@media (--viewport-sm-down) {
			.content {
				grid-column: span 2;
			}

			:global(.view-all-btn) {
				grid-area: 2 / span 3;
			}
		}

		.curator-logo {
			max-width: 9rem;
			height: 3rem;
			object-fit: contain;
		}

		.content {
			display: grid;
			gap: 0.625rem;
			min-width: 0;

			h2 {
				margin: 0;
				font: var(--f-heading-xs-medium);
				font-size: 1rem;
				letter-spacing: 0.06em;
				text-transform: uppercase;
				color: var(--c-text-light);

				@media (--viewport-sm-down) {
					font-size: 0.875rem;
				}
			}
		}

		.description {
			margin: 0;
			font: var(--f-ui-md-roman);
			color: var(--c-text-extra-light);

			a {
				text-decoration: underline;
				font-weight: 500;
			}
		}
	}
</style>
