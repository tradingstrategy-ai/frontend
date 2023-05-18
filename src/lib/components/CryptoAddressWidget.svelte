<script lang="ts">
	import { HashAddress, Icon } from '$lib/components';
	import { fade } from 'svelte/transition';
	import fsm from 'svelte-fsm';

	export let address: string;
	export let clipboardCopier = true;
	export let href: string;
	export let icon: string | undefined = undefined;
	export let size: 'sm' | 'md' | 'lg' = 'md';

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

<address class="crypto-address-widget size-{size} tile b">
	{#if icon}
		<Icon name={icon} --icon-size="1.2em" />
	{/if}
	<a {href} rel="noreferrer" target="_blank">
		<HashAddress {address} endChars={7} />
	</a>
	{#if clipboardCopier}
		<button title="Copy to clipboard" on:click={copier.copy}>
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
	{/if}
	<slot name="error" />
</address>

<style lang="postcss">
	.crypto-address-widget {
		display: grid;
		grid-auto-flow: column;
		gap: var(--space-sm);
		justify-content: center;
		align-items: center;
	}

	.size-sm {
		padding: var(--space-ss) var(--space-sl);
		font: var(--f-ui-sm-bold);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-sm-down) {
			padding: var(--space-xs) var(--space-sl);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}
	}

	.size-md {
		padding: var(--space-sm) var(--space-md);
		font: var(--f-ui-md-bold);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		@media (--viewport-sm-down) {
			padding: var(--space-ss) var(--space-sl);
			font: var(--f-ui-md-bold);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	.size-lg {
		padding: var(--space-sl) var(--space-md);
		font: var(--f-ui-lg-bold);
		letter-spacing: var(--f-ui-md-spacing, normal);
	}

	a {
		display: flex;
		overflow: hidden;
	}

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
