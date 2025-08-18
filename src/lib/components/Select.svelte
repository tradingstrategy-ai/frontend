<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import IconChevronDown from '~icons/local/chevron-down';

	let { value = $bindable(), class: classes, children, ...rest }: HTMLSelectAttributes = $props();
</script>

<div class="select {classes}">
	<select bind:value {...rest}>
		{@render children?.()}
	</select>
	<IconChevronDown />
</div>

<style>
	.select {
		--wrapper-padding: var(--space-sl);
		align-items: center;
		border: 1px var(--c-input-border) solid;
		background: var(--c-input-background);
		border-radius: var(--radius-sm);
		display: flex;
		justify-content: space-between;
		outline: none;
		position: relative;

		&:focus-within,
		&:hover {
			background: var(--c-input-background-focus);
		}

		&:focus-within {
			border-color: var(--c-input-border-focus);
			outline: none;
		}

		:global(.icon) {
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
