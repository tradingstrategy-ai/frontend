<script lang="ts">
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';
	import fsm from 'svelte-fsm';

	export let label = '';
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

<div class="smart-contract-widget">
	{#if label}
		{label}
	{/if}
	<address class="tile b">
		<a {href} rel="noreferrer" target="_blank">{address}</a>
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
	.smart-contract-widget {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		font: var(--f-ui-lg-medium);
		gap: var(--space-md);
		overflow: hidden;
	}

	address {
		display: flex;
		gap: var(--space-ss);
		padding: var(--space-sm) var(--space-sl);
		max-width: 100%;
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
		}
	}
</style>
