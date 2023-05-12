<script lang="ts">
	import { getLogoUrl, getCryptoIconUrl } from '$lib/helpers/assets';

	export let type: 'blockchain' | 'exchange' | 'token' | 'wallet';
	export let slug: MaybeString;
	export let label = '';
	export let size = '1.5rem';

	$: src = getSrc(type, slug);

	function getSrc(type: string, slug: MaybeString) {
		if (!slug) return;
		if (type === 'blockchain') return getLogoUrl(slug);
		if (type === 'token') return getCryptoIconUrl(slug);
	}
</script>

<div class="entity-symbol" style:--image-size={size}>
	{#if src}
		<div class="icon">
			<img alt={label} {src} />
		</div>
	{/if}
	<slot>{label}</slot>
</div>

<style lang="postcss">
	.entity-symbol {
		display: flex;
		gap: var(--space-sm);
		align-items: center;

		& .icon {
			display: grid;
			justify-items: center;
			width: var(--image-size);

			& img {
				height: var(--image-size);
			}
		}
	}
</style>
