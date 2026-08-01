<!--
@component
Vault group name cell with optional logo, detail text and warning marker.

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
		detail?: string;
		showPlaceholder?: boolean;
		warningLabel?: string | null;
		markerColour?: string;
		strikethrough?: boolean;
	}

	let {
		label,
		logoUrl,
		detail,
		showPlaceholder = false,
		warningLabel = null,
		markerColour,
		strikethrough = false
	}: Props = $props();

	let isWarning = $derived(Boolean(warningLabel));
</script>

<EntitySymbol {label} {logoUrl} {showPlaceholder}>
	<span class="group-copy">
		<span
			class="group-name"
			class:marked={Boolean(markerColour)}
			class:strikethrough
			class:warning={isWarning}
			style:--entity-colour={markerColour}
			title={warningLabel ?? undefined}
		>
			{#if warningLabel}
				<IconWarning --icon-size="1em" aria-hidden="true" />
			{/if}
			{#if markerColour}<span class="entity-type-marker" aria-hidden="true"></span>{/if}
			<span>{label}</span>
		</span>
		{#if detail}<span class="detail">{detail}</span>{/if}
	</span>
</EntitySymbol>

<style>
	.group-copy {
		display: grid;
		min-width: 0;
	}
	.group-name {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;

		&.marked {
			color: var(--entity-colour);
		}

		&.warning {
			color: var(--c-bearish);
			font-weight: 600;
		}

		&.strikethrough {
			color: var(--c-text-extra-light);
			text-decoration: line-through;
		}

		:global(svg) {
			flex: 0 0 auto;
			color: var(--c-bearish);
		}
	}
	.entity-type-marker {
		flex: 0 0 auto;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 0.125rem;
		background: var(--entity-colour);
	}
	.detail {
		overflow: hidden;
		color: var(--c-text-extra-light);
		font: var(--f-mono-xs-regular);
		letter-spacing: var(--f-mono-xs-spacing, normal);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
