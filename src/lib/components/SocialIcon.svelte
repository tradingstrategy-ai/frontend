<script lang="ts">
	import Icon from './Icon.svelte';

	export let name: string;
</script>

<div><Icon {name} /></div>

<style>
	div {
		--size: var(--social-icon-size, 44px);
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--size);
		width: var(--size);
		border-radius: calc(var(--size) / 2);
		background: var(--c-background-3);
		color: var(--c-background-1);
		--icon-size: calc(var(--size) / 2);
	}

	@media (min-width: 768px) {
		div {
			--size: var(--social-icon-size, 64px);
		}
	}
</style>
