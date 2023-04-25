<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="loading-spinner" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 100 }}>
	<div />
	<div />
</div>

<style>
	.loading-spinner {
		--loading-spinner-border-width: 3px;
		display: inline-block;
		position: relative;
		width: var(--loading-spinner-size, 2rem);
		height: var(--loading-spinner-size, 2rem);
	}

	.loading-spinner div {
		animation: rotate 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		box-sizing: border-box;
		display: block;
		position: absolute;
		width: var(--loading-spinner-size, 2rem);
		height: var(--loading-spinner-size, 2rem);
		border: var(--loading-spinner-border-width) solid hsla(var(--hsl-text));
		border-radius: 50%;
		border-color: hsla(var(--hsl-text)) transparent transparent transparent;
	}

	.loading-spinner:nth-child(1) {
		animation-delay: -0.375s;
	}
</style>
