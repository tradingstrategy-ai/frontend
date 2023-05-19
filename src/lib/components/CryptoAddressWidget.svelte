<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { CopyWidget, HashAddress, Icon } from '$lib/components';

	export let address: string;
	export let clipboardCopier = true;
	export let href: string;
	export let icon: string | undefined = undefined;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	let copier: ComponentProps<CopyWidget>['copier'];
</script>

<address class="crypto-address-widget size-{size} tile b">
	{#if icon}
		<Icon name={icon} --icon-size="1.2em" />
	{/if}
	<a {href} rel="noreferrer" target="_blank">
		<HashAddress {address} endChars={7} />
	</a>
	{#if clipboardCopier}
		<button title="Copy to clipboard" on:click={() => copier?.copy()}>
			<CopyWidget text={address} bind:copier />
		</button>
	{/if}
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
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
	}
</style>
