<!--
@component
Display GuardV0's automated settlement allowance per settlement window for a Lagoon vault.

The card is hidden unless GuardV0 enables a positive limit with its expected
24-hour window, preventing the UI from misrepresenting a different policy.

Newer executors report the amount settled in the active window and the window end
directly in `/metadata`; for older executors these are derived from the strategy state.
-->
<script lang="ts">
	import type { LagoonSmartContracts } from 'trade-executor/schemas/summary';
	import type { State, TreasurySync } from 'trade-executor/schemas/state';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { formatDatetime, formatDollar } from '$lib/helpers/formatters';

	type Props = {
		guard: LagoonSmartContracts['lagoon_guard_v0'];
		treasury?: TreasurySync | null;
		treasuryPromise?: Promise<TreasurySync | null | undefined>;
		state?: State;
		statePromise?: Promise<State | undefined>;
	};

	let { guard, treasury, treasuryPromise, state, statePromise }: Props = $props();

	let automatedSettlementLimit = $derived(
		guard?.automatic_settlement_window_limit_enabled &&
			guard.automatic_settlement_window_limit != null &&
			Number(guard.automatic_settlement_window_limit) > 0 &&
			guard.settlement_window_seconds === 86_400
			? guard.automatic_settlement_window_limit
			: undefined
	);

	/**
	 * Render pending treasury flow values from the trade-executor state sync section.
	 */
	function formatPendingFlow(value: number | null | undefined) {
		return formatDollar(value ?? 0, 0, 2, { notation: 'standard' });
	}

	/**
	 * Get the gross amount processed by automatic settlement in GuardV0's active window.
	 *
	 * Prefer the executor's own on-chain accounting from `/metadata` when reported. Otherwise
	 * (legacy executors) sum the individual deposit and redemption amounts recorded in the state:
	 * their sum matches the Guard's gross-flow accounting, whereas the balance-update USD value
	 * is their net difference.
	 */
	function getSettlementWindow(strategyState: State | undefined) {
		const windowSeconds = guard?.settlement_window_seconds;
		if (!windowSeconds) return undefined;

		if (guard?.settled_amount_in_window != null && guard.settlement_window_end_timestamp != null) {
			const resetAt = guard.settlement_window_end_timestamp;
			// A zero window end means no settlement has opened a window yet
			if (!resetAt || resetAt <= Date.now() / 1000) return { processed: 0, resetAt };
			return { processed: Number(guard.settled_amount_in_window), resetAt };
		}

		if (!strategyState) return undefined;

		const settlements = Object.values(strategyState.portfolio.reserves)
			.flatMap((reserve) => Object.values(reserve.balance_updates))
			.filter(
				(update) =>
					update.cause === 'deposit_and_redemption' && update.other_data?.settlement_origin === 'executor_broadcast'
			);
		const lastSettlementAt = Math.max(...settlements.map((update) => update.block_mined_at));
		if (!Number.isFinite(lastSettlementAt)) return undefined;

		const resetAt = lastSettlementAt + windowSeconds;
		if (resetAt <= Date.now() / 1000) return { processed: 0, resetAt };

		return {
			resetAt,
			processed: settlements
				.filter((update) => update.block_mined_at >= lastSettlementAt && update.block_mined_at <= resetAt)
				.reduce(
					(total, update) =>
						total + Number(update.other_data?.deposited ?? 0) + Number(update.other_data?.redeemed ?? 0),
					0
				)
		};
	}
</script>

{#snippet pendingFlowTooltip(treasury: TreasurySync | null | undefined, strategyState?: State)}
	{@const settlementWindow = getSettlementWindow(strategyState)}
	<div class="pending-flow-tooltip">
		<p>Pending deposit and redemption flow currently waiting in the treasury.</p>
		<dl>
			<div>
				<dt>Pending deposits</dt>
				<dd>{formatPendingFlow(treasury?.pending_deposits)}</dd>
			</div>
			<div>
				<dt>Pending redemptions</dt>
				<dd>{formatPendingFlow(treasury?.pending_redemptions)}</dd>
			</div>
			{#if settlementWindow}
				<div>
					<dt>Processed in 24h window so far</dt>
					<dd>{formatPendingFlow(settlementWindow.processed)}</dd>
				</div>
				<div>
					<dt>Window resets</dt>
					<dd>
						{settlementWindow.resetAt > Date.now() / 1000
							? formatDatetime(new Date(settlementWindow.resetAt * 1000))
							: 'Available now'}
					</dd>
				</div>
			{/if}
		</dl>
	</div>
{/snippet}

{#if automatedSettlementLimit}
	<MetricsBox title="Deposit and redemption flow">
		<p class="limit">
			<Tooltip>
				<span slot="trigger" class="underline"
					>{formatDollar(automatedSettlementLimit, 0, 0, { notation: 'standard' })}</span
				>
				<svelte:fragment slot="popup">
					{#if statePromise}
						{#await statePromise}
							Pending treasury flow is loading.
						{:then resolvedState}
							{@render pendingFlowTooltip(resolvedState?.sync?.treasury, resolvedState)}
						{:catch}
							Pending treasury flow is not available.
						{/await}
					{:else if treasuryPromise}
						{#await treasuryPromise}
							Pending treasury flow is loading.
						{:then resolvedTreasury}
							{@render pendingFlowTooltip(resolvedTreasury)}
						{:catch}
							Pending treasury flow is not available.
						{/await}
					{:else}
						{@render pendingFlowTooltip(treasury, state)}
					{/if}
				</svelte:fragment>
			</Tooltip><span>/24h</span>
		</p>
		<p class="description">
			Automated settlement is limited to this amount of combined deposit and redemption flow in each 24-hour settlement
			window. Larger flows require manual settlement by the vault's Safe and may take longer to process.
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

		:global(.tooltip) {
			display: inline-block;
		}

		span {
			margin-left: 0.25rem;
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md);
			color: var(--c-text-extra-light);
		}

		:global(.tooltip > .trigger > span) {
			margin-left: 0;
			font: inherit;
			letter-spacing: inherit;
			color: inherit;
		}
	}

	.description {
		margin-top: 0.5rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm);
	}

	.pending-flow-tooltip {
		display: grid;
		gap: 0.75rem;
		min-width: 14rem;

		p,
		dl {
			margin: 0;
		}

		dl {
			display: grid;
			gap: 0.5rem;
		}

		dl > div {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
		}

		dt {
			color: var(--c-text-light);
		}

		dd {
			margin: 0;
			font-weight: 500;
			color: var(--c-text);
		}
	}
</style>
