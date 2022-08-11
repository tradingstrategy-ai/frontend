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
		color: var(--c-body);
		--icon-size: calc(var(--size) / 2);
	}

	@media (--viewport-md-up) {
		div {
			--size: var(--social-icon-size, 48px);
		}
	}
</style>
