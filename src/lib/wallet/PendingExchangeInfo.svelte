<script lang="ts">
	import type { SmartContracts } from 'trade-executor/schemas/summary';
	import type { VaultWithInternalDeposits } from 'trade-executor/vaults/base';
	import type { PendingExchange, SettlementRequired } from 'trade-executor/vaults/types';
	import type { TokenBalance } from '$lib/eth-defi/schemas/token';
	import type { HexString } from 'trade-executor/schemas/utility-types';
	import fsm from 'svelte-fsm';
	import { config } from './client';
	import { waitForTransactionReceipt } from '@wagmi/core';
	import { slide } from 'svelte/transition';
	import { type RetryGenerator, retryCounter } from '$lib/helpers/retry-counter';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import IconHistory from '~icons/local/history';
	import IconSuccess from '~icons/local/success';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { errorCausedBy, formatBalance } from '$lib/eth-defi/helpers';
	import { capitalize } from '$lib/helpers/formatters';
	import { formatCycleDuration } from 'trade-executor/helpers/formatters';

	type Props = {
		type: 'deposit' | 'redemption';
		vault: VaultWithInternalDeposits<SmartContracts> & SettlementRequired;
		address: Address;
		cycleDuration: string | undefined;
		invalidateBalances: () => void;
	};

	let { type, vault, address, cycleDuration, invalidateBalances }: Props = $props();

	let pendingExchange: PendingExchange | undefined = $state.raw();
	let error: any = $state();

	let abortController: AbortController;
	let retries: RetryGenerator;

	const exchange = fsm('initial', {
		// wildcard actions (available from any state)
		'*': {
			fail: 'failed',
			reset: 'initial'
		},

		// base state on initial load, or when resetting due to wallet address change
		initial: {
			_enter() {
				pendingExchange = undefined;
			},

			load: 'loading'
		},

		// loading the pending exchange data (or waiting to retry)
		loading: {
			_enter() {
				retries = retryCounter(3, 500);
				this.getData();
			},

			_exit() {
				abortController.abort();
			},

			getData() {
				abortController = new AbortController();
				const { signal } = abortController;
				const method = type === 'deposit' ? 'getPendingDeposit' : 'getPendingRedemption';
				vault[method](config, address)
					.then((data) => {
						if (!signal.aborted) exchange.continue(data);
					})
					.catch((err) => {
						if (!signal.aborted) exchange.fail(err);
					});
			},

			continue(response: PendingExchange) {
				if (response.assets.value === 0n) return 'inital';
				pendingExchange = response;
				return 'ready';
			},

			fail(err) {
				const { value: retry, done } = retries.next();

				if (done) {
					console.error(`Error fetching pending exchange; no more retries\n`, err);
					return 'initial';
				}

				console.error(`Error fetching pending exchange; retry ${retry.count} in ${retry.delay}ms\n`, err);

				abortController = new AbortController();
				const { signal } = abortController;
				setTimeout(() => {
					if (!signal.aborted) exchange.getData();
				}, retry.delay);
			}
		},

		// waiting for user action
		ready: {
			confirm() {
				const { settled, assets, shares } = pendingExchange!;
				let request: Promise<HexString>;

				if (type === 'deposit' && !settled) {
					request = vault.cancelPendingDeposit(config);
				} else if (type === 'deposit') {
					request = vault.claimPendingDeposit(config, address, assets.value);
				} else {
					request = vault.claimPendingRedemption(config, address, shares.value);
				}

				request.then(exchange.process).catch(exchange.fail);
				return 'confirming';
			}
		},

		// confirming action in wallet
		confirming: {
			process(hash) {
				waitForTransactionReceipt(config, { hash }).then(exchange.finish).catch(exchange.fail);
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

		// failure state if something went wrong in confirming / processing
		failed: {
			_enter({ args }) {
				error ??= args[0];
			},

			_exit() {
				error = undefined;
			},

			retry: 'ready'
		},

		// final state after user has completed an action on their pending exchange (cancel or claim)
		completed: {
			_enter() {
				pendingExchange = undefined;
				invalidateBalances();
			}
		}
	});

	let buttonLabel = $derived.by(() => {
		if (!pendingExchange) return;

		const { settled, assets } = pendingExchange;

		switch (true) {
			case $exchange === 'confirming':
				return 'Confirm in wallet';
			case $exchange === 'processing':
				return 'Processing';
			case type === 'redemption':
				return `Claim ${assets.label}`;
			case settled:
				return 'Claim shares';
			default:
				return 'Cancel deposit';
		}
	});

	$effect(() => {
		// run effect whenever address changes
		address;

		exchange.reset();
		exchange.load();

		return () => {
			exchange.reset();
		};
	});

	$inspect(type, address, $exchange);
</script>

{#snippet tokenValue(token: TokenBalance, label?: string)}
	<div>
		<dt>${formatBalance(token, 2, 4)}</dt>
		<dd>{label ?? token.label}</dd>
	</div>
{/snippet}

{#if pendingExchange}
	{@const { assets, shares, settled } = pendingExchange}
	<div class={['pending-exchange', type, settled && 'settled']} transition:slide>
		<h3>
			{#if settled}
				<IconSuccess />
				{capitalize(type)} settled
			{:else}
				<IconHistory />
				Pending {type}
			{/if}
		</h3>
		<dl class="values">
			{#if type === 'deposit'}
				{@render tokenValue(assets)}
				{@render tokenValue(shares, settled ? 'shares claimable' : 'estimated shares')}
			{:else}
				{@render tokenValue(shares)}
				{@render tokenValue(assets, settled ? `${assets.label} claimable` : `estimated ${assets.label}`)}
			{/if}
		</dl>
		{#if !settled}
			<p>
				{capitalize(type)}s are settled approximately every {formatCycleDuration(cycleDuration)}.
			</p>
		{/if}
		{#if type === 'deposit' || settled}
			<Button size="sm" secondary={!settled} disabled={$exchange !== 'ready'} on:click={exchange.confirm}>
				<svelte:fragment slot="icon">
					{#if !['ready', 'failed'].includes($exchange)}<Spinner size="20" />{/if}
				</svelte:fragment>
				{buttonLabel}
			</Button>
		{/if}

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
							{#if type === 'deposit'}
								{settled ? 'claming your shares' : 'canceling your deposit'}
							{:else}
								claiming your {assets.label}
							{/if}
							there.
						</p>
					</svelte:fragment>
				</Tooltip>
				<Button tertiary size="xs" label="Try again" on:click={exchange.retry} />
			</div>
		{/if}
	</div>
{/if}

<style>
	.pending-exchange {
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

		p {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md);
		}

		.values {
			:is(dt, dd) {
				display: inline;
			}

			dd {
				color: var(--c-text-extra-light);
			}

			dt {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);
			}

			dd {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm);
			}

			div:first-child {
				dt {
					font: var(--f-ui-xl-medium);
					letter-spacing: var(--ls-ui-xl);
				}

				dd {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md);
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
