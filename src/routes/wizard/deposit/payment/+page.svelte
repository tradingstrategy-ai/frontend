<script lang="ts">
	import { captureException } from '@sentry/sveltekit';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import { wizard } from 'wizard/store';
	import { formatUnits, parseUnits } from 'viem';
	import {
		type GetBalanceReturnType,
		simulateContract,
		writeContract,
		getTransactionReceipt,
		waitForTransactionReceipt,
	} from '@wagmi/core';
	import { type SignedArguments, getSignedArguments } from '$lib/eth-defi/eip-3009';
	import { type GetTokenBalanceReturnType, formatBalance, getTokenInfo } from '$lib/eth-defi/helpers';
	import { config, wallet, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Button, Alert, CryptoAddressWidget, EntitySymbol, MoneyInput } from '$lib/components';
	import { getExplorerUrl } from '$lib/helpers/chain';

	export let data;
	const { paymentContract, tosRequired } = data;

	const denominationToken: GetTokenBalanceReturnType = $wizard.data?.denominationToken;
	const nativeCurrency: GetBalanceReturnType = $wizard.data?.nativeCurrency;

	const progressBar = tweened(0, { easing: cubicOut });
	const viewTransactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	let paymentValue = '';
	let errorMessage: MaybeString;
	let transactionId: Maybe<Address>;
	let paymentInput: MoneyInput;

	// Disable the "Cancel" button once a transaction has been initiated
	$: wizard.toggleComplete('meta:no-return', transactionId !== undefined);

	async function authorizeTransfer() {
		const token = await getTokenInfo(config, { address: denominationToken.address });
		const value = parseUnits(paymentValue, token.decimals);
		return getSignedArguments(config, {
			chainId: $wizard.data?.chainId,
			token: token,
			transferMethod: 'TransferWithAuthorization',
			from: $wallet.address!,
			to: paymentContract.address,
			value
		});
	}

	async function confirmPayment(signedArgs: SignedArguments) {
		const { tosHash, tosSignature } = $wizard.data!;
		const args = [...signedArgs, 1];
		if (tosRequired) args.push(tosHash, tosSignature);
		const parameters = { ...paymentContract, args };
	 	//const { request } = await simulateContract(config, { ...paymentContract, args });
		// https://1.x.wagmi.sh/core/actions/prepareWriteContract
		debugger;
		const { request } = await simulateContract(config, { ...paymentContract, args });
		return writeContract(config, request);
		// breakpoint;
		//return writeContract(config, parameters);

	}

	const payment = fsm('initial', {
		initial: {
			// restore state on wizard back/next navigation
			restore(state) {
				({ errorMessage, transactionId, paymentValue } = $wizard.data);
				if (state === 'authorizing' || state === 'confirming') {
					errorMessage = `Wallet request state lost due to window navigation;
						please cancel wallet request and try again.`;
					return 'failed';
				}
				return state;
			},

			authorize() {
				authorizeTransfer().then(payment.confirm).catch(payment.fail);
				return 'authorizing';
			}
		},

		authorizing: {
			confirm(signedArgs) {
				confirmPayment(signedArgs).then(payment.process).catch(payment.fail);
				return 'confirming';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('authorizeTransfer error:', eventId, err);
				if (err.name === 'UnknownRpcError' && err.details.includes('eth_signTypedData_v4')) {
					errorMessage = `
						Authorization failed because your wallet does not support typed data signatures.
						Consider using TrustWallet, Rainbow or a browser extension wallet like MetaMask.
					`;
				} else if (err.name === 'InvalidInputRpcError' && err.details.includes('User cancelled')) {
					errorMessage = `
						Authorization to transfer ${denominationToken.symbol} tokens from your wallet was refused.
						To proceed with share purchase, please try again and accept the signature request.
					`;
				} else {
					errorMessage = `Authorization to transfer ${denominationToken.symbol} tokens from your wallet failed. `;
					errorMessage += err.shortMessage ?? 'Failure reason unknown.';
				}
				return 'failed';
			}
		},

		confirming: {
			process(txId) {
				transactionId = txId;
				wizard.updateData({ transactionId });
				return 'processing';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('confirmPayment error:', eventId, err);
				errorMessage = 'Payment confirmation from wallet account failed. ';
				errorMessage += err.shortMessage ?? 'Failure reason unknown.';
				return 'failed';
			}
		},

		processing: {
			_enter({ event }) {
				const hash = transactionId!;
				let duration = 20_000;

				if (event === 'restore') {
					// try fetching receipt in case transaction already completed
					getTransactionReceipt(config, { hash }).then(payment.finish).catch(payment.noop);
					progressBar.set(50, { duration: 0 });
					duration *= 0.5;
				}

				// wait for pending transaction
				waitForTransactionReceipt(config, { hash }).then(payment.finish).catch(payment.fail);
				progressBar.set(100, { duration });
			},

			_exit() {
				progressBar.set(100, { duration: 100 });
			},

			finish(receipt) {
				if (receipt.status !== 'success') {
					console.error('waitForTransactionReceipt reverted:', receipt);
					errorMessage = `Transaction execution reverted. ${viewTransactionCopy}`;
					return 'failed';
				}
				return 'completed';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('waitForTransactionReceipt error:', eventId, err);
				if (err.name === 'CallExecutionError') {
					errorMessage = `${err.shortMessage} ${viewTransactionCopy}`;
				} else {
					errorMessage = `Unable to verify transaction status. ${viewTransactionCopy}`;
				}
				return 'failed';
			},

			noop() {}
		},

		failed: {
			_enter() {
				wizard.updateData({ errorMessage });
			},

			retry() {
				return transactionId ? 'processing' : 'initial';
			}
		},

		completed: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.set(100, { duration: 0 });
				}
				wizard.toggleComplete('payment');
			}
		}
	});

	payment.restore($wizard.data.paymentState);
	$: wizard.updateData({ paymentState: $payment });
</script>

<div class="wallet-deposit">
	<section>
		<h3>Your current balance</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					type="token"
					label={nativeCurrency.symbol}
					slug={nativeCurrency.symbol.toLowerCase()}
					size="1.5rem"
				/>
				{formatBalance(nativeCurrency, 2, 4)}
			</WalletInfoItem>

			<WalletInfoItem>
				<EntitySymbol
					slot="label"
					type="token"
					label={denominationToken.symbol}
					slug={denominationToken.symbol.toLowerCase()}
					size="1.5rem"
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
				<span class="wide">{denominationToken.symbol}</span>
			</Button>
		</header>

		<form class="payment-form" on:submit|preventDefault={payment.authorize}>
			<MoneyInput
				bind:this={paymentInput}
				bind:value={paymentValue}
				size="xl"
				tokenUnit={denominationToken.symbol}
				disabled={$payment !== 'initial'}
				min={formatUnits(1n, denominationToken.decimals)}
				max={formatBalance(denominationToken)}
				on:change={() => wizard.updateData({ paymentValue })}
			/>

			{#if $payment === 'initial'}
				<Button submit disabled={!paymentValue}>Make payment</Button>

				<!--

				Moved to the actual wallet signing message.

				<Alert size="sm" status="warning" title="Notice">
					Depositing funds in crypto trading strategies carries significant risk. Past performance is not indicative of
					future results. Only deposit funds you are willing to lose.
				</Alert>
				-->
			{/if}

			{#if $payment === 'authorizing'}
				<Alert size="sm" status="warning" title="Authorise transfer">
					Authorise the EIP-3009 transfer of {denominationToken.symbol} tokens from your wallet.
					If your wallet does not support the EIP-3009 transfer type, you will be prompted to sign a message
					and then send a transaction.
				</Alert>
			{/if}

			{#if $payment === 'confirming'}
				<Alert size="sm" status="warning" title="Confirm transaction">
					Please confirm the transaction in your wallet in order submit your payment.
				</Alert>
			{/if}

			{#if transactionId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={transactionId} href={getExplorerUrl($wallet.chain, transactionId)} />
				</div>

				<progress max="100" value={$progressBar} />
			{/if}

			{#if $payment === 'processing'}
				<Alert size="sm" status="info" title="Payment processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{viewTransactionCopy}
				</Alert>
			{/if}

			{#if $payment === 'failed'}
				<Alert size="sm" status="error" title="Error">
					{errorMessage}
					<Button slot="cta" size="sm" label="Try again" on:click={payment.retry} />
				</Alert>
			{/if}

			{#if $payment === 'completed'}
				<Alert size="sm" status="success" title="Payment completed">
					Your transaction completed successfully and the shares have been added to your wallet. Click "Next" below to
					review your share balance.
				</Alert>
			{/if}
		</form>
	</section>
</div>

<style lang="postcss">
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
