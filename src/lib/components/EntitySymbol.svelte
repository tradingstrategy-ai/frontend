<script lang="ts">
	import { removeOnError } from '$lib/actions/image';

	export let label = '';
	export let logoUrl: MaybeString = undefined;
	export let size = '1.25em';
</script>

<div class="entity-symbol" style:--image-size={size}>
	{#if logoUrl}
		<img class="logo" src={logoUrl} alt={label} use:removeOnError />
	{/if}
	{#if label || $$slots.default}
		<div class="label">
			<slot>{label}</slot>
		</div>
	{/if}
</div>

<style lang="postcss">
	.entity-symbol {
		display: flex;
		gap: 0.5ex;
		align-items: center;

		.logo {
			width: var(--image-size);
			height: var(--image-size);
		}
	}
</style>
