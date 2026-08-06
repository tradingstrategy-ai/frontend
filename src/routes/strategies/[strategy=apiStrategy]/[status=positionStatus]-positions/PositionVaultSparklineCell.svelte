<!--
@component
Vault price sparkline cell for strategy position tables.

Adds the full-row target link when the sparkline is the final table column.
-->
<script lang="ts">
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import VaultSparkline from '$lib/top-vaults/VaultSparkline.svelte';
	import type { PositionVaultSparkline } from './vault-sparklines';

	interface Props {
		vault?: PositionVaultSparkline;
		isVault: boolean;
		href: string;
		label: string;
		target?: string;
		rel?: string;
	}

	let { vault, isVault, href, label, target, rel }: Props = $props();
</script>

<div class="position-vault-sparkline-cell">
	{#if vault}
		<VaultSparkline {vault} />
	{:else if isVault}
		<span>chart unavailable</span>
	{/if}
	<TargetableLink {href} {label} {target} {rel} />
</div>

<style>
	.position-vault-sparkline-cell {
		display: grid;
		place-items: center;
		min-width: 6rem;
		min-height: 1.75rem;

		--sparkline-width: 6rem;
	}

	span {
		font: var(--f-ui-xs-roman);
		letter-spacing: var(--ls-ui-xs, normal);
		color: var(--c-text-ultra-light);
		text-align: center;
	}
</style>
