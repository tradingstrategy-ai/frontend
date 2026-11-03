<!--
@component
Displays a vault's heading and description.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import PageHeader from '$lib/components/PageHeader.svelte';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();
</script>

<PageHeader>
	{#snippet title()}
		<span class="page-title">
			<span>{vault.name}</span>
		</span>
	{/snippet}
</PageHeader>

{#if vault.short_description}
	<p class="vault-description ds-container">{vault.short_description}</p>
{/if}

<style>
	.vault-description {
		margin: 0;
		font: var(--f-ui-lg-roman);
		color: var(--c-text-light);

		@media (--viewport-md-up) {
			margin-top: 1rem;
		}
	}

	.page-title {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25em;
		align-items: center;

		@media (--viewport-sm-down) {
			font: var(--f-h2-medium);
		}
	}
</style>
