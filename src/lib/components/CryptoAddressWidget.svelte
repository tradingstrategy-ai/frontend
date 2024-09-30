<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { CopyWidget, HashAddress } from '$lib/components';

	export let address: Address;
	export let clipboardCopier = true;
	export let href: string;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	let copier: ComponentProps<CopyWidget>['copier'];
</script>

<address class="crypto-address-widget size-{size} tile b">
	<slot name="icon" />
	<a {href} rel="noreferrer" target="_blank">
		<HashAddress {address} endChars={7} />
	</a>
	{#if clipboardCopier}
		<button title="Copy to clipboard" on:click={() => copier?.copy(address)}>
			<CopyWidget bind:copier />
		</button>
	{/if}
</address>

<style>
	.crypto-address-widget {
		display: inline-grid;
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
		text-decoration: underline;
	}

	button {
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
	}
</style>
