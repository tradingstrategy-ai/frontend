<script lang="ts">
	import type { SmartContracts } from 'trade-executor/schemas/summary';
	import type { VaultWithInternalDeposits } from 'trade-executor/vaults/base';
	import type { PendingDeposit, SettlementRequired } from 'trade-executor/vaults/types';
	import fsm from 'svelte-fsm';
	import { config } from './client';
	import { waitForTransactionReceipt } from '@wagmi/core';
	import { slide } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import IconHistory from '~icons/local/history';
	import IconSuccess from '~icons/local/success';
	import { formatBalance } from '$lib/eth-defi/helpers';

	type Props = {
		vault: VaultWithInternalDeposits<SmartContracts> & SettlementRequired;
		address: Address;
	};

	let { vault, address }: Props = $props();

	let pendingDeposit = $state.raw() as PendingDeposit;

	const deposit = fsm('initial', {
		'*': {
			fail: 'failed'
		},

		initial: {
			// this is called on-mount (see $effect below)
			// TODO: custom error handling - retry with incremental backoff / max retries
			getData() {
				vault.getPendingDeposit(config, address).then(deposit.checkStatus);
			},

			checkStatus(response: PendingDeposit) {
				pendingDeposit = response;
				if (pendingDeposit.asset.value === 0n) {
					return 'completed';
				}
				return 'ready';
			}
		},

		// this state represents both "unsettled" and "settled" deposits
		// ready for a user action (cancel or claim)
		ready: {
			cancel() {
				const request = vault.cancelPendingDeposit(config);
				request.then(deposit.process).catch(deposit.fail);
				return 'confirming';
			},

			claimShares() {
				const request = vault.claimPendingDeposit(config, address, pendingDeposit.asset.value);
				request.then(deposit.process).catch(deposit.fail);
				return 'confirming';
			}
		},

		// confirming action in wallet
		confirming: {
			process(hash) {
				waitForTransactionReceipt(config, { hash }).then(deposit.finish).catch(deposit.fail);
				return 'processing';
			},

			// TODO: user cancels in wallet -> 'ready'; other error: report
			fail: 'ready'
		},

		// processing blockchain transaction
		processing: {
			finish(receipt) {
				return receipt.status === 'success' ? 'completed' : 'failed';
				// TODO: capture error info if failed
			}
		},

		failed: {
			// TODO: _enter action - capture error from args when event is 'fail'
		},

		// final state - nothing left to do!
		completed: {}
	});

	// TODO: instrument to confirm if/when this re-runs
	$effect(() => {
		deposit.getData();
	});
</script>

{#if !['initial', 'completed'].includes($deposit)}
	{@const { asset, shares, settled } = pendingDeposit}
	<div class={['pending-deposit', settled && 'settled']} transition:slide>
		<h3>
			{#if settled}
				<IconSuccess />
				Deposit settled
			{:else}
				<IconHistory />
				Pending deposit
			{/if}
		</h3>
		<dl class="values">
			<div class="asset">
				<dt>${formatBalance(asset, 2, 4)}</dt>
				<dd>{asset.label}</dd>
			</div>
			<div class="shares">
				<dt>{formatBalance(shares, 2, 4)}</dt>
				<dd>{settled ? 'shares claimable' : 'estimated shares'}</dd>
			</div>
		</dl>
		{#if settled}
			<Button size="sm" disabled={$deposit !== 'ready'} on:click={deposit.claimShares}>
				<svelte:fragment slot="icon">
					{#if $deposit !== 'ready'}<Spinner size="20" />{/if}
				</svelte:fragment>
				{$deposit === 'ready' ? 'Claim shares' : 'Claiming'}
			</Button>
		{:else}
			<Button secondary size="sm" disabled={$deposit !== 'ready'} on:click={deposit.cancel}>
				<svelte:fragment slot="icon">
					{#if $deposit !== 'ready'}<Spinner size="20" />{/if}
				</svelte:fragment>
				{$deposit === 'ready' ? 'Cancel request' : 'Canceling'}
			</Button>
		{/if}
	</div>
{/if}

<style>
	.pending-deposit {
		background: var(--c-box-2);
		border-radius: var(--radius-sl);
		padding: 1.125rem;
		display: grid;
		gap: 0.875rem;

		h3 {
			font: var(--f-heading-xs-medium);
			font-size: 0.875rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-extra-light);
			white-space: nowrap;
			display: flex;
			gap: 1ex;
			align-items: center;
			--icon-size: 1.25rem;

			.settled & {
				color: var(--c-success);
			}

			:global(.icon.history) {
				transform: scaleX(-1);
			}

			:global(.icon *) {
				stroke-width: 2.5;
			}
		}

		.values {
			:is(dt, dd) {
				display: inline;
			}

			dd {
				color: var(--c-text-extra-light);
			}

			.asset {
				dt {
					font: var(--f-ui-xl-medium);
					letter-spacing: var(--ls-ui-xl);
				}

				dd {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md);
				}
			}

			.shares {
				dt {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md);
				}

				dd {
					font: var(--f-ui-sm-medium);
					letter-spacing: var(--ls-ui-sm);
				}
			}
		}
	}
</style>
