<script lang="ts">
	import { wizard } from 'wizard/store';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import type { FetchBalanceResult } from '@wagmi/core';
	import { getPublicClient, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
	import { formatUnits, parseUnits } from 'viem';
	import { wallet, TokenBalance } from '$lib/wallet';
	import { getExplorerUrl } from '$lib/helpers/chain-explorer';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import { Alert, Button, CryptoAddressWidget, DataBox, MoneyInput } from '$lib/components';

	const contracts: Contracts = $wizard.data.contracts;
	const vaultShares: FetchBalanceResult = $wizard.data.vaultShares;
	const vaultNetValue: FetchBalanceResult = $wizard.data.vaultNetValue;

	let shares: MaybeString;
	let errorMessage: MaybeString;
	let transactionId: Maybe<Address>;
	let sharesInput: MoneyInput;

	const progressBar = tweened(0, { easing: cubicOut });

	// Disable the "Cancel" button once a transaction has been initiated
	$: wizard.toggleComplete('meta:no-return', transactionId !== undefined);

	async function confirmRedemption() {
		const sharesQuantity = parseUnits(shares, vaultShares.decimals);

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
				wizard.toggleComplete('shares-redemption');
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
		<header class="redeem-header">
			<h3 class="wide">Enter amount of shares to redeem</h3>
			<h3 class="narrow">Shares to redeem</h3>
			<Button
				secondary
				size="xs"
				on:click={() => (shares = vaultShares.formatted)}
				disabled={shares === vaultShares.formatted}
			>
				Redeem all
				<span class="wide">{vaultShares.symbol}</span>
			</Button>
		</header>

		<form class="redemption-form" on:submit|preventDefault={redemption.confirm}>
			<MoneyInput
				bind:this={sharesInput}
				bind:value={shares}
				size="xl"
				tokenUnit={vaultShares.symbol}
				conversionRatio={Number(vaultNetValue.formatted) / Number(vaultShares.formatted)}
				conversionUnit={vaultNetValue.symbol}
				conversionLabel="Estimated value"
				disabled={$redemption !== 'initial'}
				min={formatUnits(1n, vaultShares.decimals)}
				max={vaultShares.formatted}
				on:change={() => wizard.updateData({ shares })}
			/>

			{#if $redemption === 'initial'}
				<Button submit disabled={!shares}>Redeem</Button>

				<Alert size="sm" status="warning" title="Shares redeemed in-kind">
					You will receive a portion of all tokens held by this strategy, in proportion to the number of shares you are
					redeeming relative to the total strategy assets.
				</Alert>
			{/if}

			{#if $redemption === 'confirming'}
				<Alert size="sm" status="warning" title="Confirm transaction">
					Please confirm the transaction in your wallet in order process your redemption.
				</Alert>
			{/if}

			{#if transactionId}
				<div class="transaction-id">
					<h3>Transaction ID</h3>
					<CryptoAddressWidget address={transactionId} href={getExplorerUrl($wallet.chain, transactionId)} />
				</div>

				<progress max="100" value={$progressBar} />
			{/if}

			{#if $redemption === 'processing'}
				<Alert size="sm" status="info" title="Redemption processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified. Click
					the transaction ID above to view the status in the blockchain explorer.
				</Alert>
			{/if}

			{#if $redemption === 'failed'}
				<Alert size="sm" status="error" title="Error">
					{errorMessage}
					<Button slot="cta" size="sm" label="Try again" on:click={redemption.retry} />
				</Alert>
			{/if}

			{#if $redemption === 'completed'}
				<Alert size="sm" status="success" title="Redemption completed">
					Your transaction completed successfully and the redeemed tokens have been added to your wallet. Click "Next"
					below to review your redeemed token values.
				</Alert>
			{/if}
		</form>
	</section>
</div>

<style lang="postcss">
	@container section (width < 420px) {
		.wide {
			display: none;
		}
	}
	@container section (width >= 420px) {
		.narrow {
			display: none;
		}
	}

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
			margin: 0;
		}

		& .redeem-header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
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
