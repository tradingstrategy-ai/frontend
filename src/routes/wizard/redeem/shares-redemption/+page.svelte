<script lang="ts">
	import wizard from '../store';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import type { FetchBalanceResult } from '@wagmi/core';
	import { getPublicClient, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
	import { parseUnits } from 'viem';
	import { wallet, getExplorerUrl, TokenBalance } from '$lib/wallet';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import {
		AlertItem,
		AlertList,
		Button,
		CryptoAddressWidget,
		DataBox,
		MoneyInput,
		WizardActions
	} from '$lib/components';

	const contracts: Contracts = $wizard.data.contracts;
	const vaultShares: FetchBalanceResult = $wizard.data.vaultShares;
	const vaultNetValue: FetchBalanceResult = $wizard.data.vaultNetValue;

	let shares: MaybeNumber;
	let errorMessage: MaybeString;
	let transactionId: Maybe<Address>;

	const progressBar = tweened(0, { easing: cubicOut });

	async function confirmRedemption() {
		const sharesQuantity = parseUnits(`${shares}`, vaultShares.decimals);

		const { request } = await prepareWriteContract({
			address: contracts.comptroller,
			abi: comptrollerABI,
			functionName: 'redeemSharesInKind',
			args: [$wallet.address, sharesQuantity, [], []]
		});

		return writeContract(request);
	}

	const redemption = fsm('initial', {
		initial: {
			// restore state on wizard back/next navigation
			restore(state) {
				({ errorMessage, transactionId, shares } = $wizard.data);
				if (state === 'confirming') {
					errorMessage = `Wallet request state lost due to window navigation;
						please cancel wallet request and try again.`;
					return 'failed';
				}
				return state;
			},

			confirm() {
				confirmRedemption().then(redemption.process).catch(redemption.fail);
				return 'confirming';
			}
		},

		confirming: {
			process({ hash }) {
				transactionId = hash;
				wizard.updateData({ transactionId });
				return 'processing';
			},

			fail(err) {
				console.error('confirmRedemption error:', err);
				errorMessage = 'Redemption confirmation from wallet account failed.';
				return 'failed';
			}
		},

		processing: {
			_enter({ event }) {
				const hash = transactionId!;
				let duration = 20_000;

				if (event === 'restore') {
					// try fetching receipt in case transaction already completed
					getPublicClient()
						.getTransactionReceipt({ hash })
						.then(redemption.finish)
						.catch(() => {});
					progressBar.set(50, { duration: 0 });
					duration *= 0.5;
				}

				// wait for pending transaction
				waitForTransaction({ hash }).then(redemption.finish).catch(redemption.fail);
				progressBar.set(100, { duration });
			},

			_exit() {
				progressBar.set(100, { duration: 100 });
			},

			finish(receipt) {
				if (receipt.status !== 'success') {
					console.error('waitForTransaction reverted:', receipt);
					errorMessage = 'Transaction execution reverted. See blockchain explorer for details.';
					return 'failed';
				}
				return 'completed';
			},

			fail(err) {
				console.error('waitForTransaction error:', err);
				if (err.name === 'CallExecutionError') {
					errorMessage = `${err.shortMessage} See blockchain explorer for details.`;
				} else {
					errorMessage = 'Unable to verify transaction status. See blockchain explorer for details.';
				}
				return 'failed';
			}
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
				wizard.complete('shares-redemption');
			}
		}
	});

	redemption.restore($wizard.data.redemptionState);
	$: wizard.updateData({ redemptionState: $redemption });
</script>

<div class="shares-redemption">
	<section>
		<h3>Your current balance</h3>

		<DataBox label="Number of shares">
			<TokenBalance data={vaultShares} />
		</DataBox>
	</section>

	<section>
		<h3>Enter amount of shares to redeem</h3>

		<form class="redemption-form" on:submit|preventDefault={redemption.confirm}>
			<MoneyInput
				bind:value={shares}
				size="xl"
				tokenUnit={vaultShares.symbol}
				conversionRatio={Number(vaultNetValue.formatted) / Number(vaultShares.formatted)}
				conversionUnit={vaultNetValue.symbol}
				conversionLabel="This redemption is worth"
				disabled={$redemption !== 'initial'}
				on:change={() => wizard.updateData({ shares })}
			/>

			{#if $redemption === 'initial'}
				<Button disabled={!shares} size="lg" on:click={redemption.confirm}>Redeem</Button>
			{/if}

			{#if $redemption === 'confirming'}
				<AlertList size="sm" status="warning">
					<AlertItem title="Confirm transaction">
						Please confirm the transaction in your wallet in order process your redemption.
					</AlertItem>
				</AlertList>
			{/if}

			{#if transactionId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={transactionId} href={getExplorerUrl($wallet.chain, transactionId)} />
				</div>

				<progress max="100" value={$progressBar} />
			{/if}

			{#if $redemption === 'processing'}
				<AlertList size="sm" status="info">
					<AlertItem title="Redemption processing">
						The duration of processing may vary based on factors such as blockchain congestion and gas specified. Click
						the transaction ID above to view the status in the blockchain explorer.
					</AlertItem>
				</AlertList>
			{/if}

			{#if $redemption === 'failed'}
				<AlertList size="sm" status="error">
					<AlertItem title="Error">
						{errorMessage}
						<Button slot="cta" size="sm" label="Try again" on:click={redemption.retry} />
					</AlertItem>
				</AlertList>
			{/if}

			{#if $redemption === 'completed'}
				<AlertList size="sm" status="success">
					<AlertItem title="Redemption completed">
						Your transaction completed successfully and the redeemed tokens have been added to your wallet. Click "Next"
						below to review your token balances.
					</AlertItem>
				</AlertList>
			{/if}
		</form>
	</section>
</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} disabled={$wizard.completed.has('shares-redemption')} />
	<Button secondary label="Back" href="deposit-status" />
	<Button label="Next" href="success" disabled={!$wizard.completed.has('shares-redemption')} />
</WizardActions>

<style>
	.shares-redemption {
		display: grid;
		gap: var(--space-xl);

		& section {
			display: grid;
			gap: var(--space-ls);
		}

		& h3 {
			color: hsla(var(--hsl-text-light));
			font: var(--f-ui-lg-medium);
		}

		& .redemption-form {
			display: grid;
			gap: var(--space-xl);
		}

		& progress {
			width: 100%;
		}

		& .transaction-id {
			display: grid;
			gap: var(--space-ss);
			justify-content: flex-start;
		}
	}
</style>
