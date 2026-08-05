<!--
@component
Display GuardV0's daily automated settlement allowance for a Lagoon vault.

The card is hidden unless GuardV0 enables a positive limit with its expected
24-hour cooldown, preventing the UI from misrepresenting a different policy.
-->
<script lang="ts">
	import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	type Props = {
		guard: LagoonSmartContracts['lagoon_guard_v0'];
	};

	let { guard }: Props = $props();

	let automatedSettlementLimit = $derived(
		guard?.daily_automatic_settlement_limit_enabled &&
			guard.daily_automatic_settlement_limit != null &&
			Number(guard.daily_automatic_settlement_limit) > 0 &&
			guard.settlement_cooldown_seconds === 86_400
			? guard.daily_automatic_settlement_limit
			: undefined
	);
</script>

{#if automatedSettlementLimit}
	<MetricsBox title="Deposit and redemption flow">
		<p class="limit">{formatDollar(automatedSettlementLimit, 0, 0, { notation: 'standard' })}<span>/24h</span></p>
		<p class="description">
			Automated settlement is limited to this amount of combined deposit and redemption flow each day. Larger flows
			require manual settlement by the vault's Safe and may take longer to process.
		</p>
	</MetricsBox>
{/if}

<style>
	.limit,
	.description {
		margin: 0;
	}

	.limit {
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--ls-heading-xl);
		color: var(--c-text);

		span {
			margin-left: 0.25rem;
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md);
			color: var(--c-text-extra-light);
		}
	}

	.description {
		margin-top: 0.5rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm);
	}
</style>
