<script lang="ts">
	import { getLogoUrl } from '$lib/helpers/assets';

	export let type: 'blockchain' | 'exchange' | 'token' | 'wallet';
	export let slug: MaybeString;
	export let label = '';
	export let size = '1.5rem';

	$: src = getLogoUrl(type, slug);
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
		display: grid;
		grid-auto-flow: column;
		gap: var(--space-sm);
		align-items: center;
		justify-content: flex-start;

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
