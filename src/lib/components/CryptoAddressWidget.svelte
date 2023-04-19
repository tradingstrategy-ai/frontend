<script lang="ts">
	import { Icon } from '$lib/components';
	import { fade } from 'svelte/transition';
	import fsm from 'svelte-fsm';

	export let address: string;
	export let href: string;
	export let size: 'md' | 'sm' = 'md';

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
	<a {href} rel="noreferrer" target="_blank">{address}</a>
	<button title="Copy to clipboard" on:click={copier.copy}>
		<!-- NOTE: {#key} block causes choppy animation flicker; using {#if…else} to achieve smooth cross-fade -->
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

<style lang="postcss">
	.crypto-address-widget {
		display: grid;
		grid-auto-flow: column;
		gap: var(--space-ss);
		justify-self: flex-start;
	}

	.size-md {
		padding: var(--space-sm) var(--space-sl);
		font: var(--f-ui-lg-bold);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		@media (--viewport-sm-down) {
			padding: var(--space-ss) var(--space-sl);
			font: var(--f-ui-md-bold);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	.size-sm {
		padding: var(--space-ss) var(--space-sl);
		font: var(--f-ui-md-bold);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-sm-down) {
			padding: var(--space-xs) var(--space-sl);
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}
	}

	a {
		text-decoration: underline;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
