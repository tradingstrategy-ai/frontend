<!--
@component
Server-rendered links to the largest similar vaults on the same protocol, with their headline
APY and TVL, plus links to the protocol and denomination hubs.

@example

```svelte
	<SimilarVaults vaults={data.similarVaults} {vault} />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { getVaultAssetType, getVaultProtocolDisplayName } from '$lib/top-vaults/helpers';
	import type { SimilarVault } from '$lib/top-vaults/similar-vaults';
	import type { VaultInfo } from '$lib/top-vaults/schemas';

	interface Props {
		vault: VaultInfo;
		vaults: SimilarVault[];
	}

	let { vault, vaults }: Props = $props();

	let protocolName = $derived(getVaultProtocolDisplayName(vault));
	let assetTypePlural = $derived(`${getVaultAssetType(vault)}s`);
</script>

{#if vaults.length}
	<MetricsBox class="similar-vaults" title={`Similar ${protocolName} ${assetTypePlural}`}>
		<ul>
			{#each vaults as similar (similar.slug)}
				<li>
					<a href={resolve('/vaults/[vault=slug]', { vault: similar.slug })}>{similar.name}</a>
					<span class="figures">
						{#if similar.apy != null}APY {formatPercent(similar.apy, 1)}{/if}
						{#if similar.apy != null && similar.tvlUsd != null}·{/if}
						{#if similar.tvlUsd != null}TVL {formatDollar(similar.tvlUsd, 1, 1)}{/if}
					</span>
				</li>
			{/each}
		</ul>
		<p class="more">
			<a href={resolve(`/vaults/protocols/${vault.protocol_slug}`)}>All {protocolName} {assetTypePlural}</a>
			<!-- denomination hubs exist for stablecoins only -->
			{#if vault.stablecoinish}
				·
				<a href={resolve(`/vaults/stablecoins/${vault.denomination_slug}`)}
					>All {vault.denomination} {assetTypePlural}</a
				>
			{/if}
		</p>
	</MetricsBox>
{/if}

<style>
	ul {
		display: grid;
		gap: var(--space-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs) var(--space-md);
		justify-content: space-between;
	}

	.figures {
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
		white-space: nowrap;
	}

	.more {
		margin: var(--space-md) 0 0;
		font: var(--f-ui-sm-medium);
	}

	a {
		text-decoration: underline;
	}
</style>
