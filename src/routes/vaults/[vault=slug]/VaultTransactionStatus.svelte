<!--
@component
Displays vault deposit and redemption availability when either operation is restricted.

@example

```svelte
	<VaultTransactionStatus {vault} />
```
-->
<script lang="ts">
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { isGoodVaultStatus, isVaultDepositCapped } from '$lib/top-vaults/helpers';
	import type { VaultInfo } from '$lib/top-vaults/schemas';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let isPrivate = $derived(vault.whitelist?.status === 'whitelisted');
	let isCapped = $derived(isVaultDepositCapped(vault));
	let depositStatus = $derived(
		isPrivate
			? isCapped
				? 'Private — Capped'
				: vault.deposit_closed_reason
					? `Private — ${vault.deposit_closed_reason}`
					: 'Private'
			: isCapped
				? 'Capped'
				: vault.deposit_closed_reason
	);
	let showTransactionStatus = $derived(isPrivate || !isGoodVaultStatus(vault));

	function getDaysUntil(dateString: string | null): number | null {
		if (!dateString) return null;
		const targetDate = new Date(dateString);
		const diffMs = targetDate.getTime() - Date.now();
		return Math.floor(diffMs / (1000 * 60 * 60 * 24));
	}

	let depositDaysLeft = $derived(getDaysUntil(vault.deposit_next_open));
	let redemptionDaysLeft = $derived(getDaysUntil(vault.redemption_next_open));
</script>

{#if showTransactionStatus}
	<MetricsBox class="transaction-status" title="Transaction status">
		<div class="status-grid">
			<div class="status-item">
				<span class="status-label">Deposits</span>
				{#if depositStatus}
					<span class={['status-value', isPrivate ? 'private' : 'closed']}>{depositStatus}</span>
					{#if depositDaysLeft !== null && depositDaysLeft >= 0}
						<span class="status-next-open">Opens in {depositDaysLeft} {depositDaysLeft === 1 ? 'day' : 'days'}</span>
					{/if}
				{:else}
					<span class="status-value open">Open</span>
				{/if}
			</div>
			<div class="status-item">
				<span class="status-label">Redemptions</span>
				{#if vault.redemption_closed_reason}
					<span class="status-value closed">{vault.redemption_closed_reason}</span>
					{#if redemptionDaysLeft !== null && redemptionDaysLeft >= 0}
						<span class="status-next-open"
							>Opens in {redemptionDaysLeft} {redemptionDaysLeft === 1 ? 'day' : 'days'}</span
						>
					{/if}
				{:else}
					<span class="status-value open">Open</span>
				{/if}
			</div>
		</div>
	</MetricsBox>
{/if}

<style>
	.status-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap);
	}

	.status-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.status-label {
		font: var(--f-ui-sm-medium);
		color: var(--c-text-light);
	}

	.status-value {
		font: var(--f-ui-md-medium);

		&.open {
			color: var(--c-success);
		}

		&.closed {
			color: var(--c-error);
		}

		&.private {
			color: var(--c-bearish);
		}
	}

	.status-next-open {
		margin-top: 0.25rem;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-light);
	}
</style>
