<script lang="ts">
	import { Icon } from '$lib/components';

	let classes = '';
	export { classes as classes };
	export let id: string | null = null;
	export let name: string | null = null;
	export let value: string | Array<string>;
</script>

<div class="select-wrapper {classes}">
	<select {name} {id} bind:value>
		<slot />
	</select>
	<Icon name="chevron-down" --icon-size="1rem" />
</div>

<style lang="postcss">
	.select-wrapper {
		--wrapper-padding: var(--space-sl);
		align-items: center;
		border: 1px solid transparent !important;
		background: var(--c-background-2-v1);
		border-radius: var(--radius-sm) !important;
		display: flex;
		justify-content: space-between;
		position: relative;
	}

	:global .select-wrapper:focus-within {
		border: 1px solid hsla(var(--hsl-text-extra-light)) !important;
		border-radius: var(--radius-sm) !important;
		outline: none;
	}

	.select-wrapper :global(svg) {
		position: absolute;
		right: var(--wrapper-padding);
	}

	select {
		appearance: none;
		background: none;
		border: none;
		outline: none;
		padding: var(--wrapper-padding);
		width: 100%;
	}
</style>
