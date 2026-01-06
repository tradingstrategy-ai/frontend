<!--
  Widget displaying protocol information on the vault detail page.
  Shows short description and link to view all protocol vaults.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';

	interface Props {
		vault: VaultInfo;
		protocolMetadata: VaultProtocolMetadata;
	}

	let { vault, protocolMetadata }: Props = $props();

	const protocolPageUrl = `/trading-view/vaults/protocols/${vault.protocol_slug}`;
</script>

<MetricsBox title="About {protocolMetadata.name}">
	<div class="protocol-info">
		{#if protocolMetadata.logos.light}
			<img src={protocolMetadata.logos.light} alt={protocolMetadata.name} class="protocol-logo" />
		{/if}
		<p class="description">{protocolMetadata.short_description}</p>
		<a href={protocolPageUrl} class="view-all-link">
			View all {protocolMetadata.name} vaults →
		</a>
	</div>
</MetricsBox>

<style>
	.protocol-info {
		display: grid;
		gap: var(--space-md);
	}

	.protocol-logo {
		height: 2rem;
		width: auto;
		justify-self: start;
	}

	.description {
		margin: 0;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);
	}

	.view-all-link {
		font: var(--f-ui-sm-medium);
		color: var(--c-text-extra-light);
		text-decoration: none;
		transition: color var(--time-sm);

		&:hover {
			color: var(--c-text);
		}
	}
</style>
