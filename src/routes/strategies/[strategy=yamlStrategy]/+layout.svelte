<!--
Layout for YAML-configured strategies — heading with sidebar navigation.
-->
<script lang="ts">
	import { page } from '$app/state';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { AlertList, DataBadge, PageHeading } from '$lib/components';
	import DebugFreshnessData from '$lib/components/DebugFreshnessData.svelte';
	import { getMenuOptions, default as YamlStrategyNav } from './YamlStrategyNav.svelte';

	export let data;
	const isBetaTag = (tag: string) => tag.toLowerCase() === 'beta';

	$: ({ strategy, backtestAvailable } = data);

	$: tags = strategy.tags.filter((tag: string) => tag !== 'live');
	$: isPrivate = !strategy.tags.includes('live');

	$: iconUrl = strategy.icon_url ?? `/avatars/${strategy.slug}.webp`;

	$: allMenuOptions = getMenuOptions(backtestAvailable);
	$: breadcrumbs = {
		[strategy.slug]: strategy.name,
		...Object.fromEntries(allMenuOptions.map(({ slug, label }) => [slug, label]))
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<main class="yaml-strategy-layout ds-container ds-3">
	<DebugFreshnessData label={`yaml-strategy:${strategy.slug}`} data={data.debugFreshness} />

	<PageHeading description={strategy.short_description}>
		<svelte:fragment slot="icon">
			<img src={iconUrl} alt="{strategy.name} icon" />
		</svelte:fragment>
		<svelte:fragment slot="title">
			{strategy.name}

			{#each tags as tag}
				<DataBadge class="badge" status={isBetaTag(tag) ? 'beta' : 'warning'}>{tag}</DataBadge>
			{/each}
		</svelte:fragment>
	</PageHeading>

	{#if isPrivate}
		<AlertList status="error" size="md" let:AlertItem>
			<AlertItem title="Private strategy">This strategy is only available to admins – please do not share.</AlertItem>
		</AlertList>
	{/if}

	<div class="subpage">
		<YamlStrategyNav
			basePath="/strategies/{strategy.slug}"
			currentPath={page.url.pathname}
			{backtestAvailable}
			vaultAddress={strategy.vault_address}
		/>
		<slot />
	</div>
</main>

<style>
	.yaml-strategy-layout {
		display: grid;
		gap: var(--space-md);

		:global(.badge) {
			font-size: clamp(10px, 0.4em, 14px);
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}

		.subpage {
			display: grid;
			gap: var(--space-ls);

			@media (--viewport-lg-up) {
				gap: var(--space-5xl);
				grid-template-columns: 14rem auto;
			}
		}
	}
</style>
