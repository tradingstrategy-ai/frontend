<!--
Layout for YAML-configured strategies — simple heading with no side navigation.
-->
<script lang="ts">
	import { page } from '$app/state';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { AlertList, DataBadge, PageHeading } from '$lib/components';

	export let data;

	$: ({ strategy } = data);

	$: tags = strategy.tags.filter((tag: string) => tag !== 'live');
	$: isPrivate = !strategy.tags.includes('live');

	$: breadcrumbs = {
		[strategy.id]: strategy.name
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<main class="yaml-strategy-layout ds-container ds-3">
	<PageHeading description={strategy.short_description}>
		<svelte:fragment slot="icon">
			{#if strategy.icon_url}
				<img src={strategy.icon_url} alt="{strategy.name} icon" />
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="title">
			{strategy.name}

			{#each tags as tag}
				<DataBadge class="badge" status="warning">{tag}</DataBadge>
			{/each}
		</svelte:fragment>
	</PageHeading>

	{#if isPrivate}
		<AlertList status="error" size="md" let:AlertItem>
			<AlertItem title="Private strategy">This strategy is only available to admins – please do not share.</AlertItem>
		</AlertList>
	{/if}

	<slot />
</main>

<style>
	.yaml-strategy-layout {
		display: grid;
		gap: var(--space-md);

		:global(.badge) {
			font-size: clamp(11px, 0.45em, 16px);
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}
</style>
