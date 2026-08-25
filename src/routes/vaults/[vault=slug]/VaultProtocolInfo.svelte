<!--
  Widget displaying protocol information on the vault detail page.
  Shows short description and link to view all protocol vaults.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import Button from '$lib/components/Button.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { resolve } from '$app/paths';

	interface Props {
		vault: VaultInfo;
		protocolMetadata: VaultProtocolMetadata;
	}

	let { vault, protocolMetadata }: Props = $props();

	let protocolPageUrl = $derived(resolve(`/vaults/protocols/${vault.protocol_slug}`));
	let assetType = $derived(vault.flags.includes('tokenised_fund') ? 'tokenised fund' : 'vault');
</script>

<MetricsBox fill>
	<div class="protocol-info">
		<div class="content">
			<div class="heading">
				{#if protocolMetadata.logos.light}
					{@const protocolLogoUrl = getVaultProtocolLogoUrl(protocolMetadata.slug)}
					{#if protocolLogoUrl}
						<img src={protocolLogoUrl} alt={protocolMetadata.name} class="protocol-logo" />
					{/if}
				{/if}
				<h2>Running on {protocolMetadata.name} protocol</h2>
			</div>
			<p class="description">
				This {assetType} is running on <a href={protocolPageUrl}>{protocolMetadata.name}</a>:
			</p>
			<p class="description">{protocolMetadata.short_description}</p>
		</div>
		<Button size="sm" class="view-all-btn" href={protocolPageUrl}>
			View all {protocolMetadata.name} vaults
		</Button>
	</div>
</MetricsBox>

<style>
	.protocol-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;

		.protocol-logo {
			height: 3rem;
			width: auto;
		}

		.content {
			display: grid;
			gap: 0.625rem;
			min-width: 0;

			.heading {
				display: flex;
				gap: 1rem;
				align-items: center;
			}

			h2 {
				margin: 0;
				font: var(--f-heading-xs-medium);
				font-size: 1rem;
				letter-spacing: 0.06em;
				text-transform: uppercase;
				color: var(--c-text-light);

				@media (--viewport-sm-down) {
					font-size: 0.875rem;
				}
			}
		}

		:global(.view-all-btn) {
			align-self: center;
			margin-top: auto;
		}

		.description {
			margin: 0;
			font: var(--f-ui-md-roman);
			color: var(--c-text-extra-light);

			a {
				text-decoration: underline;
				font-weight: 500;
			}
		}
	}
</style>
