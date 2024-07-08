<script lang="ts">
	export let label = '';
	export let logoUrl: MaybeString = undefined;
	export let size = '1.25em';
</script>

<div class="entity-symbol" style:--image-size={size}>
	{#if logoUrl}
		<div class="icon">
			<img alt={label} src={logoUrl} />
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
