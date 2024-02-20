<script lang="ts">
	import { DataBadge } from '$lib/components';

	let className: string = '';
	export { className as class };
	export let tags: string[] = [];
	export let includeLive = false;
</script>

{#each tags as tag}
	{@const isLive = tag === 'live'}
	{#if !isLive || includeLive}
		<DataBadge class={className} status={isLive ? 'success' : 'warning'}>{tag}</DataBadge>
	{/if}
{/each}
