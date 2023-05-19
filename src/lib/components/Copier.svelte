<!--
@component
Display a copy icon that copies the provided text to the clipboard when clicked.

#### Usage:
```tsx
<Copier
copyText="This text will be copied to the clipboard when the icon is clicked."
hoverText="This text will be displayed when the icon is hovered over."
/>
```
-->
<script lang="ts">
	import fsm from 'svelte-fsm';
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';

	export let copyText: string;
	export let hoverText: string = 'Copy to clipboard';

	const copier = fsm('idle', {
		idle: {
			copy() {
				navigator.clipboard.writeText(copyText).then(this.success);
			},
			success: 'copied'
		},

		copied: {
			_enter() {
				this.complete.debounce(2000);
			},
			complete: 'idle'
		}
	});
</script>

<button title={hoverText} on:click={copier.copy}>
	<!-- NOTE: {#key} block causes choppy animation flicker; using {#if…else} to achieve smooth cross-fade -->
	{#if $copier === 'idle'}
		<span in:fade|local={{ duration: 250, delay: 250 }} out:fade|local={{ duration: 100 }}>
			<Icon name="copy-to-clipboard" />
		</span>
	{:else}
		<span in:fade|local={{ duration: 100 }} out:fade|local={{ duration: 500 }}>
			<Icon name="check-square" />
		</span>
	{/if}
</button>

<style>
	button {
		display: grid;
		border: none;
		min-width: 1em;
		padding: 0;
		background: none;
		cursor: pointer;

		& span {
			grid-area: 1 / 1;
		}
	}
</style>
