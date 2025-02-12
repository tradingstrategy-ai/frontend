<script lang="ts">
	import type { SmartContracts } from 'trade-executor/schemas/summary';
	import type { VaultWithInternalDeposits } from 'trade-executor/vaults/base';
	import type { PendingDeposit, SettlementRequired } from 'trade-executor/vaults/types';
	import fsm from 'svelte-fsm';
	import { onMount } from 'svelte';
	import { config } from './client';
	import { waitForTransactionReceipt } from '@wagmi/core';
	import { slide } from 'svelte/transition';
	import { retryCounter } from '$lib/helpers/retry-counter';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import IconHistory from '~icons/local/history';
	import IconSuccess from '~icons/local/success';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { errorCausedBy } from '$lib/eth-defi/helpers';
	import { formatBalance } from '$lib/eth-defi/helpers';

	type Props = {
		vault: VaultWithInternalDeposits<SmartContracts> & SettlementRequired;
		address: Address;
		invalidateBalances: () => void;
	};

	let { vault, address, invalidateBalances }: Props = $props();

	let pendingDeposit = $state.raw() as PendingDeposit;
	let error: any = $state();

	const retries = retryCounter(3, 500);

	const deposit = fsm('initial', {
		'*': {
			fail: 'failed',
			bail: 'completed'
		},

		initial: {
			// see retry action below
			_exit() {
				clearTimeout(retries.timer);
			},

			// this is called on-mount (see $effect below)
			getData() {
				const request = vault.getPendingDeposit(config, address);
				request.then(deposit.checkStatus).catch(deposit.retry);
			},

			checkStatus(response: PendingDeposit) {
				pendingDeposit = response;
				if (pendingDeposit.assets.value === 0n) {
					return 'completed';
				}
				return 'ready';
			},

			retry(err) {
				const { value: retry, done } = retries.next();

				if (done) {
					console.error(`Error fetching pending deposit; no more retries\n`, err);
					return;
				}

				console.error(`Error fetching pending deposit; retry ${retry.count} in ${retry.delay}ms\n`, err);
				retries.timer = setTimeout(deposit.getData, retry.delay);
			}
		},

		// waiting for user action
		ready: {
			confirm() {
				const request = pendingDeposit.settled
					? vault.claimPendingDeposit(config, address, pendingDeposit.assets.value)
					: vault.cancelPendingDeposit(config);
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

			fail(err) {
				return errorCausedBy(err, 'UserRejectedRequestError') ? 'ready' : 'failed';
			}
		},

		// processing blockchain transaction
		processing: {
			finish(receipt) {
				if (receipt.status === 'success') return 'completed';

				error = new Error('Transaction execution reverted.');
				error.cause = receipt;
				return 'failed';
			}
		},

		failed: {
			_enter({ args }) {
				error ??= args[0];
			},

			_exit() {
				error = undefined;
			},

			retry() {
				return error.state ?? 'ready';
			}
		},

		completed: {
			_enter({ event }) {
				if (event === 'finish') {
					invalidateBalances();
				}
			}
		}
	});

	let buttonDisabled = $derived($deposit !== 'ready');

	let buttonLabel = $derived.by(() => {
		switch ($deposit) {
			case 'confirming':
				return 'Confirm in wallet';
			case 'processing':
				return 'Processing';
			default:
				return pendingDeposit.settled ? 'Claim shares' : 'Cancel deposit';
		}
	});

	onMount(() => {
		deposit.getData();
		return deposit.bail;
	});
</script>

{#if !['initial', 'completed'].includes($deposit)}
	{@const { assets, shares, settled } = pendingDeposit}
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
			<div class="assets">
				<dt>${formatBalance(assets, 2, 4)}</dt>
				<dd>{assets.label}</dd>
			</div>
			<div class="shares">
				<dt>{formatBalance(shares, 2, 4)}</dt>
				<dd>{settled ? 'shares claimable' : 'estimated shares'}</dd>
			</div>
		</dl>
		<Button size="sm" secondary={!settled} disabled={buttonDisabled} on:click={deposit.confirm}>
			<svelte:fragment slot="icon">
				{#if buttonDisabled && $deposit !== 'failed'}<Spinner size="20" />{/if}
			</svelte:fragment>
			{buttonLabel}
		</Button>
		{#if error}
			<div class="error" transition:slide={{ duration: 100 }}>
				<Tooltip>
					<span slot="trigger">
						<span class="underline">Error</span>
						<IconQuestionCircle />
					</span>
					<svelte:fragment slot="popup">
						<h4>The following error occurred:</h4>
						<p>{error.shortMessage ?? String(error)}</p>
						<p>
							Click <strong>Try again</strong> to reset the form and retry your <strong>{buttonLabel}</strong> request.
							Or visit the <a href={vault.externalProviderUrl} target="_blank" rel="noreferrer">{vault.mode}</a> to try
							{settled ? 'claming your shares' : 'canceling your deposit'} there.
						</p>
					</svelte:fragment>
				</Tooltip>
				<Button tertiary size="xs" label="Try again" on:click={deposit.retry} />
			</div>
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

			:global(.icon.history) {
				transform: scaleX(-1);
			}

			:global(.icon *) {
				stroke-width: 2.5;
			}
		}

		/* NOTE: nesting inside h3 as `.settled &` causes PostCSS transform warning  */
		&.settled h3 {
			color: var(--c-success);
		}

		.values {
			:is(dt, dd) {
				display: inline;
			}

			dd {
				color: var(--c-text-extra-light);
			}

			.assets {
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

		.error {
			display: flex;
			align-items: center;
			justify-content: space-evenly;
			margin-block: -0.25rem;
			text-align: center;

			[slot='trigger'] {
				display: flex;
				gap: 0.5ex;
				font: var(--f-ui-sm-bold);
				color: var(--c-error);
				--icon-size: 1.25em;
			}

			.underline {
				border-bottom-color: currentColor;
			}

			h4 {
				font: var(--f-ui-sm-bold);
				margin-bottom: 1em;
			}

			p {
				margin-top: 1em;
			}

			a {
				font-weight: bold;
			}
		}
	}
</style>
