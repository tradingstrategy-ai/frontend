<script lang="ts">
	import { Icon } from '$lib/components';

	let classes = '';
	export { classes as class };
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let value: string | undefined = undefined;
</script>

<div class="select {classes}">
	<select {name} {id} bind:value on:change>
		<slot />
	</select>
	<Icon name="chevron-down" --icon-size="1rem" />
</div>

<style lang="postcss">
	.select {
		--wrapper-padding: var(--space-sl);
		align-items: center;
		border: 1px hsl(var(--hsla-input-border)) solid;
		background: hsl(var(--hsla-input-background));
		border-radius: var(--radius-sm);
		display: flex;
		justify-content: space-between;
		outline: none;
		position: relative;

		&:focus-within,
		&:hover {
			background: hsl(var(--hsla-input-background-focus));
		}

		&:focus-within {
			border-color: hsl(var(--hsla-input-border-focus));
			outline: none;
		}

		:global svg {
			position: absolute;
			right: var(--wrapper-padding);
			pointer-events: none;
		}
	}

	select {
		appearance: none;
		background: none;
		border: none;
		color: inherit;
		outline: none;
		padding: var(--wrapper-padding);
		padding-right: calc(var(--wrapper-padding) + var(--space-lg));
		width: 100%;
	}
</style>
