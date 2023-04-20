<script lang="ts">
	import { getLogoUrl, getCryptoIconUrl } from '$lib/helpers/assets';

	export let type: 'blockchain' | 'exchange' | 'token' | 'wallet';
	export let slug: string;
	export let label: MaybeString = undefined;
	export let size = '1.5rem';

	$: src = type === 'blockchain' ? getLogoUrl(slug) : type === 'token' ? getCryptoIconUrl(slug) : undefined;
</script>

<div class="entity-symbol" style:--image-size={size}>
	{#if src}
		<div class="icon">
			<img alt={label} {src} />
		</div>
	{/if}
	{label}
</div>

<style lang="postcss">
	.entity-symbol {
		display: flex;
		gap: var(--space-sm);
		align-items: center;

		& .icon {
			display: grid;
			width: var(--image-size);

			& img {
				width: 100%;
			}
		}
	}
</style>
