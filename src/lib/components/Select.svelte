<script lang="ts">
	import { Icon } from '$lib/components';

	export let id: string | null = null;
	export let name: string | null = null;
	export let value: string | Array<string>;
</script>

<div class="select-wrapper">
	<select {name} {id} bind:value>
		<slot />
	</select>
	<Icon name="chevron-down" --icon-size="1rem" />
</div>

<style lang="postcss">
	.select-wrapper {
		--wrapper-padding: var(--space-sl);
		align-items: center;
		/* background: hsla(var(--hsl-box), var(--a-box-a)); */
		background: var(--c-background-2-v1);
		border-radius: var(--radius-xs);
		display: flex;
		justify-content: space-between;
		position: relative;
	}

	.select-wrapper :global(svg) {
		position: absolute;
		right: var(--wrapper-padding);
	}

	select {
		appearance: none;
		background: none;
		border: none;
		padding: var(--wrapper-padding);
		width: 100%;
	}
</style>
