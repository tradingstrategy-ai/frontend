<script lang="ts">
	import { getLogoUrl } from '$lib/helpers/assets';

	export let type: 'blockchain' | 'exchange' | 'token' | 'wallet';
	export let slug: MaybeString;
	export let label = '';
	export let size = '1.25em';

	$: src = getLogoUrl(type, slug);
</script>

<div class="entity-symbol" style:--image-size={size}>
	{#if src}
		<div class="icon">
			<img alt={label} {src} />
		</div>
	{/if}
	{#if label || $$slots.default}
		<div class="label">
			<slot>{label}</slot>
		</div>
	{/if}
</div>

<style lang="postcss">
	.entity-symbol {
		display: grid;
		grid-auto-flow: column;
		gap: calc(var(--image-size) / 3);
		align-items: center;
		justify-content: flex-start;

		.icon {
			display: grid;
			justify-items: center;
			width: var(--image-size);

			img {
				height: var(--image-size);
			}
		}
	}
</style>
