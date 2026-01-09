<!--
  Widget displaying protocol information on the vault detail page.
  Shows short description and link to view all protocol vaults.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import Button from '$lib/components/Button.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { resolve } from '$app/paths';

	interface Props {
		vault: VaultInfo;
		protocolMetadata: VaultProtocolMetadata;
	}

	let { vault, protocolMetadata }: Props = $props();

	const protocolPageUrl = resolve(`/trading-view/vaults/protocols/${vault.protocol_slug}`);
</script>

<MetricsBox>
	<div class="protocol-info">
		{#if protocolMetadata.logos.light}
			<img src={protocolMetadata.logos.light} alt={protocolMetadata.name} class="protocol-logo" />
		{/if}
		<div class="content">
			<h2>About {protocolMetadata.name}</h2>
			<p class="description">{protocolMetadata.short_description}</p>
		</div>
		<Button size="sm" class="view-all-btn" href={protocolPageUrl}>
			View all {protocolMetadata.name} vaults
		</Button>
	</div>
</MetricsBox>

<style>
	.protocol-info {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: center;

		&:has(.protocol-logo) {
			grid-template-columns: auto 1fr auto;
		}

		@media (--viewport-sm-down) {
			.content {
				grid-column: span 2;
			}

			:global(.view-all-btn) {
				grid-area: 2 / span 3;
			}
		}

		.protocol-logo {
			height: 3rem;
			width: auto;
		}

		.content {
			display: grid;
			gap: 0.625rem;

			h2 {
				margin: 0;
				font: var(--f-heading-xs-medium);
				font-size: 1rem;
				letter-spacing: 0.06em;
				text-transform: uppercase;
				color: var(--c-text-ultra-light);

				@media (--viewport-sm-down) {
					font-size: 0.875rem;
				}
			}
		}

		.description {
			margin: 0;
			font: var(--f-ui-md-roman);
			color: var(--c-text-light);
		}
	}
</style>
