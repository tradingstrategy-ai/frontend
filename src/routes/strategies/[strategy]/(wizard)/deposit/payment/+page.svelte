<script lang="ts">
	import type { DepositWizardDataSchema, DepositWizardData } from '../+layout';
	import { captureException } from '@sentry/sveltekit';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import fsm from 'svelte-fsm';
	import { formatUnits, parseUnits } from 'viem';
	import { waitForTransactionReceipt } from '@wagmi/core';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { type ErrorInfo, extractErrorInfo, formatBalance, getExpectedBlockTime } from '$lib/eth-defi/helpers';
	import { config, wallet } from '$lib/wallet/client';
	import { Alert, Button, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import PaymentError from './PaymentError.svelte';
	import { getProgressBar } from '$lib/helpers/progressbar';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatNumber } from '$lib/helpers/formatters';

	// Delay (ms) between signature request and payment transaction
	const WALLET_PAYMENT_DELAY = 500;

	const { data } = $props();
	const { chain, denominationTokenInfo, canForwardPayment, vault } = data;

	const wizard = getWizardContext<DepositWizardDataSchema>();
	const { denominationToken, nativeCurrency, tosHash, tosSignature } = wizard.data as Required<DepositWizardData>;

	const progressBar = getProgressBar(-1, getExpectedBlockTime(chain.id));

	const transactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	let address = $derived($wallet.address!);
	let paymentValue = $state('');
	let value = $derived(parseUnits(paymentValue, denominationTokenInfo.decimals));
	let sharePrice: MaybeNumber = $state();
	let estimatedShares = $derived(Number(paymentValue ?? 0) / (sharePrice ?? 0));
	let isPreApproved = $state(false);
	let approvalTxId: Maybe<Address> = $state();
	let paymentTxId: Maybe<Address> = $state();
	let error: ErrorInfo | unknown | undefined = $state();

	const payment = fsm('initial', {
		'*': { fail: 'failed' },

		initial: {
			_enter() {
				progressBar.reset();

				vault
					.getSharePriceUSD(config)
					.then((value) => (sharePrice = value))
					.catch(() => {}); // no-op
			},

			// restore state on wizard back/next navigation
			restore(state) {
				if (['authorizing', 'approving', 'confirming'].includes(state)) {
					error = { name: 'NavigationLostStateError', state };
					return 'failed';
				}
				return state;
			},

			authorizeOrApprove() {
				// use authorization (signature) flow if supported by vault
				if (canForwardPayment) {
					vault
						.getTransferAuthorization(config, address, value)
						.then((signedArgs) => {
							// insert short delay to address Rabby wallet race condition
							setTimeout(() => payment.confirm(signedArgs), WALLET_PAYMENT_DELAY);
						})
						.catch(payment.fail);

					return 'authorizing';
				}

				// otherwise, fall back to traditional approve flow (check allowance first)
				vault
					.getDepositAllowance(config, address)
					.then((allowance) => {
						isPreApproved = value <= allowance;
						payment.handleCheck();
					})
					.catch(payment.handleCheck);

				return 'checkingPreApproved';
			}
		},

		authorizing: {
			confirm(signedArgs) {
				vault
					.buySharesWithAuthorization(config, signedArgs, tosHash, tosSignature)
					.then(payment.process)
					.catch(payment.fail);

				return 'confirming';
			}
		},

		checkingPreApproved: {
			handleCheck() {
				if (isPreApproved) return 'approved';
				vault.approveDepositAllowance(config, value).then(payment.process).catch(payment.fail);
				return 'approving';
			}
		},

		approving: {
			process(txId) {
				approvalTxId = txId;
				return 'processingApproval';
			}
		},

		processingApproval: {
			_enter({ event }) {
				progressBar.start(event === 'restore' ? 50 : 0);
				waitForTransactionReceipt(config, { hash: approvalTxId! }).then(payment.finish).catch(payment.fail);
			},

			_exit() {
				progressBar.finish();
			},

			finish(receipt) {
				if (receipt.status === 'success') return 'approved';

				error = {
					name: 'TransactionRevertedError',
					shortMessage: 'Transaction execution reverted.',
					cause: receipt,
					state: 'processingApproval'
				};
				return 'failed';
			}
		},

		approved: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.finish(0);
				}
			},

			_exit() {
				progressBar.reset();
			},

			buyShares() {
				vault.buyShares(config, address, value).then(payment.process).catch(payment.fail);
				return 'confirming';
			}
		},

		confirming: {
			process(txId) {
				paymentTxId = txId;
				return 'processing';
			}
		},

		processing: {
			_enter({ event }) {
				progressBar.start(event === 'restore' ? 50 : 0);
				waitForTransactionReceipt(config, { hash: paymentTxId! }).then(payment.finish).catch(payment.fail);
			},

			_exit() {
				progressBar.finish();
			},

			finish(receipt) {
				if (receipt.status !== 'success') {
					error = { name: 'TransactionRevertedError', cause: receipt, state: 'processing' };
					return 'failed';
				}

				wizard.data.transactionLogs = receipt.logs;
				return 'completed';
			}
		},

		failed: {
			_enter({ from, args: [err] }) {
				if (error) return;
				error = extractErrorInfo(err, from as string);
				captureException(err);
			},

			_exit() {
				error = undefined;
			},

			retry() {
				return paymentTxId ? 'processing' : 'initial';
			}
		},

		completed: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.finish(0);
				}
				wizard.toggleComplete('payment');
			}
		}
	});

	// Disable the "Cancel" button once a transaction has been initiated
	$effect(() => {
		wizard.toggleComplete('meta:no-return', paymentTxId !== undefined);
	});

	// capture/restore ephemeral page state when navigating away from and back to page
	// NOTE: Svelte's "snapshot" feature only works with browser-native back/forward nav
	beforeNavigate(() => {
		wizard.data.snapshot = { state: $payment, paymentValue, sharePrice, approvalTxId, paymentTxId, error };
	});

	afterNavigate(() => {
		const { state, ...rest } = wizard.data.snapshot ?? {};
		({ paymentValue, sharePrice, approvalTxId, paymentTxId, error } = rest);
		payment.restore(state);
		delete wizard.data.snapshot;
	});
</script>

<div class="wallet-deposit">
	<section>
		<h3>Your current balance</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					size="1.5rem"
					label={nativeCurrency.symbol}
					logoUrl={getLogoUrl('token', nativeCurrency.symbol)}
				/>
				{formatBalance(nativeCurrency, 2, 4)}
			</WalletInfoItem>

			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					size="1.5rem"
					label={denominationToken.label}
					logoUrl={getLogoUrl('token', denominationToken.symbol)}
				/>
				{formatBalance(denominationToken, 2, 4)}
			</WalletInfoItem>
		</WalletInfo>
	</section>

	<section>
		<header class="deposit-header">
			<h3 class="wide">Enter amount to deposit</h3>
			<h3 class="narrow">Deposit amount</h3>
			<Button
				secondary
				size="xs"
				on:click={() => (paymentValue = formatBalance(denominationToken))}
				disabled={paymentValue === formatBalance(denominationToken)}
			>
				Deposit all
				<span class="wide">{denominationToken.label}</span>
			</Button>
		</header>

		<form
			class="payment-form"
			onsubmit={(e) => {
				e.preventDefault();
				payment.authorizeOrApprove();
			}}
		>
			<MoneyInput
				bind:value={paymentValue}
				size="xl"
				token={denominationToken}
				disabled={$payment !== 'initial'}
				required
				min={formatUnits(1n, denominationToken.decimals)}
				max={formatBalance(denominationToken)}
			>
				Estimated shares:
				{formatNumber(estimatedShares, 2, 4)}
			</MoneyInput>

			{#if !['processing', 'completed'].includes($payment)}
				{#if canForwardPayment}
					<Button submit disabled={$payment !== 'initial'}>Deposit</Button>
				{:else}
					<div class="buttons">
						<Button submit disabled={$payment !== 'initial'}>
							Approve {denominationToken.label}
						</Button>
						<Button disabled={$payment !== 'approved'} on:click={payment.buyShares}>Deposit</Button>
					</div>
				{/if}
			{:else if paymentTxId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={paymentTxId} href={getExplorerUrl(chain, paymentTxId)} />
				</div>
			{/if}

			{#if $progressBar >= 0}
				<progress max="100" value={$progressBar}></progress>
			{/if}

			{#if $payment === 'initial' && vault.requiresSettlement()}
				<Alert size="sm" status="warning" title="Settlement period required">
					Your deposit will show as <i>pending</i> during settlement. Once complete, you'll be able to claim your
					deposited shares.
					<a href={vault.settlementInfoUrl} target="_blank" rel="noreferrer">Learn more about settlement</a>
				</Alert>
			{/if}

			{#if $payment === 'authorizing'}
				<Alert size="sm" status="info" title="Authorise transfer">
					Authorise the EIP-3009 transfer of {denominationToken.symbol} tokens from your wallet. If your wallet does not
					support the EIP-3009 transfer type, you will be prompted to sign a message and then send a transaction.
				</Alert>
			{/if}

			{#if $payment === 'approving'}
				<Alert size="sm" status="info" title="Approve transfer">
					Please approve the requested {denominationToken.label} spending cap in your wallet. This allows the designated
					amount of {denominationToken.label} to be transfered from your wallet to purchase shares.
				</Alert>
			{/if}

			{#if $payment === 'approved'}
				<Alert size="sm" status="success" title="Transfer approved">
					{denominationToken.label} spending cap
					{#if isPreApproved}
						has already been
					{/if}
					approved. Please click "Buy shares" to complete your purchase.
				</Alert>
			{/if}

			{#if $payment === 'processingApproval'}
				<Alert size="sm" status="info" title="Approval processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{transactionCopy}
				</Alert>
			{/if}

			{#if $payment === 'confirming'}
				<Alert size="sm" status="info" title="Confirm transaction">
					Please confirm the transaction in your wallet in order submit your payment.
				</Alert>
			{/if}

			{#if $payment === 'processing'}
				<Alert size="sm" status="info" title="Payment processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{transactionCopy}
				</Alert>
			{/if}

			{#if $payment === 'failed'}
				<Alert size="sm" status="error" title="Error">
					<PaymentError {error} symbol={denominationToken.symbol} {transactionCopy} />
					<Button slot="cta" size="xs" label="Try again" on:click={payment.retry} />
				</Alert>
			{/if}

			{#if $payment === 'completed'}
				<Alert size="sm" status="success" title="Payment completed">
					{#if vault.requiresSettlement()}
						Your transaction completed successfully. Your shares will be available to claim once the settlement period
						is complete.
					{:else}
						Your transaction completed successfully and the shares have been added to your wallet.
					{/if}
					Click "Next" below to review your deposit details.
				</Alert>
			{/if}
		</form>
	</section>
</div>

<style>
	@container (width < 420px) {
		.wide {
			display: none;
		}
	}
	@container (width >= 420px) {
		.narrow {
			display: none;
		}
	}

	.wallet-deposit {
		display: grid;
		gap: var(--space-3xl);

		section {
			display: grid;
			gap: var(--space-ls);
		}

		h3 {
			color: var(--c-text-light);
			font: var(--f-ui-lg-medium);
			margin: 0;
		}

		.deposit-header {
			container-type: inline-size;
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		.payment-form {
			display: grid;
			gap: var(--space-xl);
		}

		.buttons {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
			gap: 0.75rem;
		}

		progress {
			width: 100%;
		}

		.transaction-id {
			display: grid;
			gap: var(--space-ss);
			justify-content: flex-start;
		}
	}
</style>
