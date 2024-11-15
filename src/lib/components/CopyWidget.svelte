<!--
@component
Display a copy icon that copies the provided text to the clipboard. The component exports
a `copy` method – bind a variable to a component instance and call `copyWidget.copy()`
(from a button, for instance).

@example

```svelte
	<button title="copy to clipboard" on:click={() => copyWidget.copy("This will be copied to clipboard")}>
		<CopyWidget bind:this={copyWidget} />
	</button>
```
-->
<script lang="ts">
	import fsm from 'svelte-fsm';
	import IconCopyToClipboard from '~icons/local/copy-to-clipboard';
	import IconCheckSquare from '~icons/local/check-square';
	import { fade } from 'svelte/transition';

	const copier = fsm('idle', {
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

	export const { copy } = copier;
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
