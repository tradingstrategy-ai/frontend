<!--
@component
Display a copy icon that copies the provided text to the clipboard. The component exports
a `copier` store with a `copy` method – bind this to a variable and call `copier.copy()`
(from a button, for instance).

#### Usage:
```tsx
	<button title="copy to clipboard" on:click={() => copier.copy()}>
		<CopyWidget bind:copier text="This will be copied to clipboard" />
	</button>
```
-->
<script lang="ts">
	import fsm from 'svelte-fsm';
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';

	export let text: string;

	export const copier = fsm('idle', {
		idle: {
			copy() {
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

<div class="copy-widget">
	{#key $copier}
		<span transition:fade|local={{ duration: 100 }}>
			<Icon name={$copier === 'idle' ? 'copy-to-clipboard' : 'check-square'} />
		</span>
	{/key}
</div>

<style lang="postcss">
	.copy-widget {
		display: grid;

		& span {
			grid-area: 1 / -1;
		}
	}
</style>
