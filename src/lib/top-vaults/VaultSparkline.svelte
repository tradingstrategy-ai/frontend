<!--
@component
Render a vault's 90-day price sparkline, optionally leaving no fallback text when unavailable.

The `<img>` declares the sparkline's intrinsic size and the wrapper reserves the same aspect
ratio, so table rows do not shift when the image loads or when the fallback text is shown
(an unsized image here shows up directly in the site's Cumulative Layout Shift).
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

	/** Intrinsic size of the SVGs served by the sparkline service. */
	const SPARKLINE_WIDTH = 72;
	const SPARKLINE_HEIGHT = 18;

	let src = $derived(getVaultSparklineUrl(vault));

	let loadError = $state(false);
</script>

<div class="vault-sparkline" style:aspect-ratio="{SPARKLINE_WIDTH} / {SPARKLINE_HEIGHT}">
	{#if !src || loadError}
		{#if !hideUnavailable}chart unavailable{/if}
	{:else}
		<img
			{src}
			alt="{vault.name} 90 day price"
			width={SPARKLINE_WIDTH}
			height={SPARKLINE_HEIGHT}
			loading="lazy"
			decoding="async"
			onerror={() => (loadError = true)}
		/>
	{/if}
</div>

<style>
	.vault-sparkline {
		width: var(--sparkline-width, 100%);
		display: grid;
		align-items: center;
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--ls-ui-sm, normal);
		color: var(--c-text-ultra-light);
		text-align: center;

		img {
			width: inherit;
			height: auto;
			scale: 1 var(--sparkline-vertical-scale, 1);
		}
	}
</style>
