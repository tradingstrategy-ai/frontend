<!--
@component
Render a vault's 90-day price sparkline, optionally leaving no fallback text when unavailable.
-->
<script lang="ts">
	import type { SlimVaultInfo } from './schemas';
	import { getVaultSparklineUrl } from './helpers';

	interface Props {
		vault: Pick<SlimVaultInfo, 'id' | 'name'>;
		/** Keep the layout empty instead of showing a fallback message when chart data is unavailable. */
		hideUnavailable?: boolean;
	}

	let { vault, hideUnavailable = false }: Props = $props();

	let src = $derived(getVaultSparklineUrl(vault));

	let loadError = $state(false);
</script>

<div class="vault-sparkline">
	{#if !src || loadError}
		{#if !hideUnavailable}chart unavailable{/if}
	{:else}
		<img {src} alt="{vault.name} 90 day price" onerror={() => (loadError = true)} />
	{/if}
</div>

<style>
	.vault-sparkline {
		width: var(--sparkline-width, 100%);
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--ls-ui-sm, normal);
		color: var(--c-text-ultra-light);
		text-align: center;

		img {
			width: inherit;
			scale: 1 var(--sparkline-vertical-scale, 1);
		}
	}
</style>
