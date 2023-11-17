<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type SearchHit from './SearchHit.svelte';
	import { Icon } from '$lib/components';
	import { formatSwapFee } from '$lib/helpers/formatters';

	export let document: ComponentProps<SearchHit>['document'];
	export let isLowQuality: boolean;
	export let showWarningIcon = false;
</script>

<div class="search-hit-description truncate lines-2">
	{#if document.type === 'pair'}
		{document.name}
		{#if Number.isFinite(document.pool_swap_fee)}
			<span class="swap-fee">{formatSwapFee(document.pool_swap_fee)}</span>
		{/if}
		on {document.exchange}
	{:else}
		{document.description}
	{/if}

	{#if showWarningIcon && isLowQuality}
		<span class="warning-icon"><Icon name="warning" /></span>
	{/if}
</div>

<style lang="postcss">
	.search-hit-description {
		font: var(--search-hit-description-font, var(--f-ui-md-medium));
		letter-spacing: var(--search-hit-description-spacing, var(--f-ui-md-spacing, normal));

		.swap-fee {
			color: hsl(var(--hsl-text-extra-light));
		}

		.warning-icon {
			display: inline-block;
			transform: translate(0.25em, -0.1em);
		}
	}
</style>
