<!--
@component
Display a copy icon that copies the provided text to the clipboard. The component exports
a `copier` store with a `copy` method – bind this to a variable and call `copier.copy()`
(from a button, for instance).

@example

```svelte
	<button title="copy to clipboard" on:click={() => copier.copy("This will be copied to clipboard")}>
		<CopyWidget bind:copier />
	</button>
```
-->
<script lang="ts">
	import fsm from 'svelte-fsm';
	import IconCopyToClipboard from '~icons/local/copy-to-clipboard';
	import IconCheckSquare from '~icons/local/check-square';
	import { fade } from 'svelte/transition';

	export const copier = fsm('idle', {
		idle: {
			copy(text: string) {
				navigator.clipboard.writeText(text).then(this.success);
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

<span class="copy-widget">
	{#key $copier}
		<span transition:fade={{ duration: 100 }}>
			{#if $copier === 'idle'}
				<IconCopyToClipboard />
			{:else}
				<IconCheckSquare />
			{/if}
		</span>
	{/key}
</span>

<style>
	.copy-widget {
		display: inline-grid;

		span {
			grid-area: 1 / -1;
		}
	}
</style>
