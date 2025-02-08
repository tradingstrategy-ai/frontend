<script lang="ts">
	import type { RedeemWizardData, RedeemWizardDataSchema } from '../+layout';
	import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';
	import { captureException } from '@sentry/sveltekit';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { simulateContract, writeContract, getTransactionReceipt, waitForTransactionReceipt } from '@wagmi/core';
	import { formatUnits, parseUnits } from 'viem';
	import { formatBalance, getExpectedBlockTime } from '$lib/eth-defi/helpers';
	import { config, wallet } from '$lib/wallet/client';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import { Alert, Button, CryptoAddressWidget, DataBox, EntitySymbol, MoneyInput } from '$lib/components';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';
	import { formatNumber } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	const { chain, strategy } = data;

	const wizard = getWizardContext<RedeemWizardDataSchema>();

	const onChainData = strategy.on_chain_data as EnzymeOnChainData;

	const { vaultShares, vaultNetValue } = wizard.data as Required<RedeemWizardData>;

	let shares: string | undefined = $state();
	let errorMessage: string | undefined = $state();
	let transactionId: Address | undefined = $state();

	const progressBar = tweened(0, { easing: cubicOut });
	const viewTransactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	// Disable the "Cancel" button once a transaction has been initiated
	$effect(() => {
		wizard.toggleComplete('meta:no-return', transactionId !== undefined);
	});

	async function confirmRedemption() {
		const sharesQuantity = parseUnits(shares!, vaultShares.decimals);

		const { request } = await simulateContract(config, {
			address: onChainData.smart_contracts.comptroller,
			abi: comptrollerABI,
			functionName: 'redeemSharesInKind',
			args: [$wallet.address!, sharesQuantity, [], []]
		});

		return writeContract(config, request);
	}

	function getEstimatedValue(shares: Numberlike) {
		const sharePrice = Number(formatBalance(vaultNetValue)) / Number(formatBalance(vaultShares));
		const estimated = (Number(shares) || 0) * sharePrice;
		return formatNumber(estimated, 2, 4);
	}

	const redemption = fsm('initial', {
		initial: {
			// restore state on wizard back/next navigation
			restore(state) {
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
			process(txId) {
				transactionId = txId;
				return 'processing';
			},

			fail(err) {
				const eventId = captureException(err);
				console.error('confirmRedemption error:', eventId, err);
				errorMessage = err.shortMessage ?? 'Redemption confirmation from wallet account failed.';
				return 'failed';
			}
		},

		processing: {
			_enter({ event }) {
				const hash = transactionId!;
				let duration = getExpectedBlockTime(chain.id);

				if (event === 'restore') {
					// try fetching receipt in case transaction already completed
					getTransactionReceipt(config, { hash }).then(redemption.finish).catch(redemption.noop);
					progressBar.set(50, { duration: 0 });
					duration *= 0.5;
				}

				// wait for pending transaction
				waitForTransactionReceipt(config, { hash }).then(redemption.finish).catch(redemption.fail);
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

				wizard.data.transactionLogs = receipt.logs;
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

	// capture/restore ephemeral state when navigating away from and back to page
	// NOTE: Svelte's "snapshot" feature only works with browser-native back/forward nav
	beforeNavigate(() => {
		wizard.updateData({ redemptionState: $redemption, shares, transactionId, errorMessage });
	});

	afterNavigate(() => {
		({ shares, transactionId, errorMessage } = wizard.data);
		redemption.restore(wizard.data.redemptionState);
	});
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
				on:click={() => (shares = formatBalance(vaultShares))}
				disabled={shares === formatBalance(vaultShares)}
			>
				Redeem all
				<span class="wide">{vaultShares.symbol}</span>
			</Button>
		</header>

		<form
			class="redemption-form"
			onsubmit={(e) => {
				e.preventDefault();
				redemption.confirm();
			}}
		>
			<MoneyInput
				bind:value={shares}
				size="xl"
				token={vaultShares}
				disabled={$redemption !== 'initial'}
				min={formatUnits(1n, vaultShares.decimals)}
				max={formatBalance(vaultShares)}
			>
				Estimated value
				<EntitySymbol label={vaultNetValue.label} logoUrl={getLogoUrl('token', vaultNetValue.symbol)}>
					{getEstimatedValue(shares!)}
					{vaultNetValue.label}
				</EntitySymbol>
			</MoneyInput>

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
					<CryptoAddressWidget address={transactionId} href={getExplorerUrl(chain, transactionId)} />
				</div>

				<progress max="100" value={$progressBar}></progress>
			{/if}

			{#if $redemption === 'processing'}
				<Alert size="sm" status="info" title="Redemption processing">
					The duration of processing may vary based on factors such as blockchain congestion and gas specified.
					{viewTransactionCopy}
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

	.shares-redemption {
		container-type: inline-size;
		display: grid;
		gap: var(--space-xl);

		section {
			display: grid;
			gap: var(--space-ls);
		}

		h3 {
			color: var(--c-text-light);
			font: var(--f-ui-lg-medium);
			margin: 0;
		}

		.redeem-header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		.redemption-form {
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
