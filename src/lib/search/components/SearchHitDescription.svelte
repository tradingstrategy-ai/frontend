<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type SearchHit from './SearchHit.svelte';
	import IconWarning from '~icons/local/warning';
	import { formatSwapFee } from '$lib/helpers/formatters';

	export let document: ComponentProps<SearchHit>['document'];
	export let isLowQuality: boolean;
	export let showWarningIcon = false;
</script>

<div class="search-hit-description truncate lines-2">
	{#if document.type === 'pair'}
		{document.name}
		{#if Number.isFinite(document.pair_swap_fee)}
			<span class="swap-fee">{formatSwapFee(document.pair_swap_fee)}</span>
		{/if}
		on {document.exchange}
	{:else}
		{document.description}
	{/if}

	{#if showWarningIcon && isLowQuality}
		<IconWarning />
	{/if}
</div>

<style lang="postcss">
	.search-hit-description {
		font: var(--search-hit-description-font, var(--f-ui-md-medium));
		letter-spacing: var(--search-hit-description-spacing, var(--f-ui-md-spacing, normal));

		.swap-fee {
			color: var(--c-text-extra-light);
		}

		:global(.icon.warning) {
			transform: translate(0.25ex, -0.125ex);
		}
	}
</style>
