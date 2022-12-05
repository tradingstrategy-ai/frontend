<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Menu, MenuItem, PageHeading } from '$lib/components';

	export let data: LayoutData;

	$: summary = data.summary;

	$: path = $page.url.pathname;

	$: breadcrumbs = {
		[summary.id]: summary.name,
		'open-positions': 'Open positions'
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<main class="ds-container">
	<PageHeading>
		<h1>{summary.name}</h1>
		<p class="subtitle">{summary.long_description}</p>
	</PageHeading>

	<nav>
		<Menu horizontal>
			<MenuItem noScroll label="Overview" targetUrl="/strategies/{summary.id}" active={path.endsWith(summary.id)} />
			<MenuItem
				noScroll
				label="Open positions"
				targetUrl="/strategies/{summary.id}/open-positions"
				active={path.endsWith('open-positions')}
			/>
			<MenuItem label="Instance status" targetUrl="/strategy/{summary.id}/instance" />
			<MenuItem label="Logs" targetUrl="/strategy/{summary.id}/logs" />
		</Menu>
	</nav>

	<slot />
</main>

<style lang="postcss">
	.subtitle {
		font: var(--f-ui-md-medium);
	}

	nav {
		margin-block: 1.25rem 0.5rem;
		--menu-item-padding: 1rem;
		--menu-item-border-radius: var(--border-radius-md);
		--menu-item-color: var(--c-text-extra-light);
		--menu-item-active-color: var(--c-text-default);
	}
</style>
