<script lang="ts">
	import { removeOnError } from '$lib/actions/image';

	export let label = '';
	export let logoUrl: MaybeString = undefined;
	export let size = '1.25em';
	export let showPlaceholder = false;
</script>

<div class="entity-symbol" style:--image-size={size}>
	{#if logoUrl}
		<img class="logo" src={logoUrl} alt={label} use:removeOnError />
	{:else if showPlaceholder}
		<span class="placeholder-logo" aria-hidden="true"></span>
	{/if}
	{#if label || $$slots.default}
		<div class="label">
			<slot>{label}</slot>
		</div>
	{/if}
</div>

<style>
	.entity-symbol {
		display: flex;
		gap: calc(var(--image-size) / 3);
		align-items: center;

		.logo {
			width: var(--image-size);
			height: var(--image-size);
		}

		.placeholder-logo {
			box-sizing: border-box;
			width: var(--image-size);
			height: var(--image-size);
			border: 1px solid var(--c-text-ultra-light);
			border-radius: 50%;
			flex: 0 0 var(--image-size);
		}
	}
</style>
