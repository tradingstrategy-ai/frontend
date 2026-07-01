<!--
@component
Vault group name cell with optional logo and warning marker.

Used by group listing tables for protocol, chain, curator and stablecoin rows.

@example

```svelte
  <VaultGroupNameCell label="USDC" logoUrl="/metadata-logo/stablecoin/usdc" />
```
-->
<script lang="ts">
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import IconWarning from '~icons/local/warning';

	interface Props {
		label: string;
		logoUrl?: string;
		showPlaceholder?: boolean;
		warningLabel?: string | null;
	}

	let { label, logoUrl, showPlaceholder = false, warningLabel = null }: Props = $props();

	let isWarning = $derived(Boolean(warningLabel));
</script>

<EntitySymbol {label} {logoUrl} {showPlaceholder}>
	<span class="group-name" class:warning={isWarning} title={warningLabel ?? undefined}>
		{#if warningLabel}
			<IconWarning --icon-size="1em" aria-hidden="true" />
		{/if}
		<span>{label}</span>
	</span>
</EntitySymbol>

<style>
	.group-name {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;

		&.warning {
			color: var(--c-bearish);
			font-weight: 600;
		}

		:global(svg) {
			flex: 0 0 auto;
			color: var(--c-bearish);
		}
	}
</style>
