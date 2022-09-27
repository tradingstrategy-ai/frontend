<script lang="ts">
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';
	import fsm from 'svelte-fsm';

	export let address: string;
	export let href: string;

	const clipboard = fsm('idle', {
		idle: {
			copy: 'copying'
		},

		copying: {
			_enter() {
				navigator.clipboard.writeText(address).then(this.success).catch(this.error);
			},
			success: 'copied',
			error: 'idle'
		},

		copied: {
			_enter() {
				this.complete.debounce(2000);
			},
			complete: 'idle',
			copy: 'copying'
		}
	});
</script>

<div>
	<a {href} target="_blank">{address}</a>
	<button title="Copy to clipboard" on:click={clipboard.copy}>
		<Icon name="copy" />
		{#if $clipboard === 'copied'}
			<span in:fade={{ duration: 100 }} out:fade={{ duration: 1000 }}>
				<Icon name="copied" />
			</span>
		{/if}
	</button>
</div>

<style lang="postcss">
	div {
		display: flex;
		max-width: max-content;
		gap: 0.5rem;
	}

	a {
		font-weight: 700;
		text-decoration: underline;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	button {
		position: relative;
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;

		& span {
			position: absolute;
			left: 0;
			top: 0;
		}
	}
</style>
