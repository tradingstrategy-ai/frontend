<script lang="ts">
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';
	import fsm from 'svelte-fsm';

	export let label = '';
	export let address: string;
	export let href = '';

	const copier = fsm('idle', {
		idle: {
			copy() {
				navigator.clipboard.writeText(address).then(this.success);
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

<div class="wallet-address-widget hash-widget">
	{#if label}
		{label}
	{/if}
	<address class="tile b">
		<a {href} rel="noreferrer" target="_blank">{address}</a>
		<button title="Copy to clipboard" on:click={copier.copy}>
			{#key $copier}
				<Icon name={$copier === 'idle' ? 'copy-to-clipboard' : 'check-square'} />
			{/key}
		</button>
	</address>
</div>
