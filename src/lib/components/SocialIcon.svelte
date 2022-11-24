<script lang="ts">
	import { Icon } from '$lib/components';

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
		background: var(--c-background-3-v1);
		color: var(--c-body-v1);
		--icon-size: calc(var(--size) * var(--social-icon-scale, 0.5));
	}

	@media (--viewport-md-up) {
		div {
			--size: var(--social-icon-size, 48px);
		}
	}
</style>
