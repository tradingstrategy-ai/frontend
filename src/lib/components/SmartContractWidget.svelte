<script lang="ts">
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';
	import fsm from 'svelte-fsm';

	export let label: string;
	export let address: string;
	export let href: string;

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

<div>
	{label}
	<address>
		<a {href} target="_blank">{address}</a>
		<button title="Copy to clipboard" on:click={copier.copy}>
			{#if $copier === 'idle'}
				<span in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 100 }}>
					<Icon name="copy-to-clipboard" />
				</span>
			{:else}
				<span in:fade={{ duration: 100 }} out:fade={{ duration: 500 }}>
					<Icon name="check-square" />
				</span>
			{/if}
		</button>
	</address>
</div>

<style lang="postcss">
	div {
		overflow: hidden;
	}

	address {
		display: flex;
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
		min-width: 1em;
		padding: 0;
		background: none;
		cursor: pointer;

		& span {
			position: absolute;
			left: 0px;
			top: 0px;
			background: var(--c-body);
		}
	}
</style>
