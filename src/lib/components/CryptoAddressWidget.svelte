<script lang="ts">
	import { CopyWidget, HashAddress } from '$lib/components';
	import type { Snippet } from 'svelte';

	interface Props {
		address: Address;
		clipboardCopier?: boolean;
		href: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		icon?: Snippet;
	}

	let { address, clipboardCopier = true, href, size = 'md', class: classes, icon }: Props = $props();

	let copyWidget = $state<CopyWidget>();
</script>

<span class="crypto-address-widget size-{size} tile b {classes}">
	{@render icon?.()}
	<a {href} rel="noreferrer" target="_blank">
		<HashAddress {address} endChars={7} />
	</a>
	{#if clipboardCopier}
		<button title="Copy to clipboard" onclick={() => copyWidget?.copy(address)}>
			<CopyWidget bind:this={copyWidget} />
		</button>
	{/if}
</span>

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
