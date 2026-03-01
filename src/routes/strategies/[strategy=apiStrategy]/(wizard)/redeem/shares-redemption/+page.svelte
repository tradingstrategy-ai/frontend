<script lang="ts">
	import type { RedeemWizardData, RedeemWizardDataSchema } from '../+layout';
	import { captureException } from '@sentry/sveltekit';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import fsm from 'svelte-fsm';
	import { formatUnits, parseUnits } from 'viem';
	import { waitForTransactionReceipt } from '@wagmi/core';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { type ErrorInfo, extractErrorInfo, formatBalance, getExpectedBlockTime } from '$lib/eth-defi/helpers';
	import { config, wallet } from '$lib/wallet/client';
	import { Alert, AlertList, Button, CryptoAddressWidget, DataBox, EntitySymbol, MoneyInput } from '$lib/components';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';
	import RedemptionError from './RedemptionError.svelte';
	import { getProgressBar } from '$lib/helpers/progressbar';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatNumber } from '$lib/helpers/formatters';

	let { data } = $props();
	let { chain, vault, denominationToken } = $derived(data);

	const wizard = getWizardContext<RedeemWizardDataSchema>();
	const { vaultShares } = wizard.data as Required<RedeemWizardData>;

	// svelte-ignore state_referenced_locally
	const progressBar = getProgressBar(0, getExpectedBlockTime(chain.id));

	const transactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	let address = $derived($wallet.address!);
	let sharesValue = $state('');
	let shares = $derived(parseUnits(sharesValue, vaultShares.decimals));
	let sharePrice: MaybeNumber = $state();
	let estimatedValue = $derived(Number(sharesValue ?? 0) * (sharePrice ?? 0));
	let transactionId: Address | undefined = $state();
	let error: ErrorInfo | unknown | undefined = $state();

	const redemption = fsm('initial', {
		'*': {
			fail: 'failed'
		},

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
				if (state === 'confirming') {
					error = { name: 'NavigationLostStateError', state };
					return 'failed';
				}
				return state;
			},

			confirm() {
				vault.redeemShares(config, address, shares).then(redemption.process).catch(redemption.fail);
				return 'confirming';
			}
		},

		confirming: {
			process(txId) {
				transactionId = txId;
				return 'processing';
			}
		},

		processing: {
			_enter({ event }) {
				const hash = transactionId!;
				progressBar.start(event === 'restore' ? 50 : 0);
				waitForTransactionReceipt(config, { hash }).then(redemption.finish).catch(redemption.fail);
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
				return transactionId ? 'processing' : 'initial';
			}
		},

		completed: {
			_enter({ event }) {
				if (event === 'restore') {
					progressBar.finish(0);
				}
				wizard.toggleComplete('shares-redemption');
			}
		}
	});

	// Disable the "Cancel" button once a transaction has been initiated
	$effect(() => {
		wizard.toggleComplete('meta:no-return', transactionId !== undefined);
	});

	// capture/restore ephemeral state when navigating away from and back to page
	// NOTE: Svelte's "snapshot" feature only works with browser-native back/forward nav
	beforeNavigate(() => {
		wizard.data.snapshot = { state: $redemption, sharesValue, sharePrice, transactionId, error };
	});

	afterNavigate(() => {
		const { state, ...rest } = wizard.data.snapshot ?? {};
		({ sharesValue, sharePrice, transactionId, error } = rest);
		redemption.restore(state);
		delete wizard.data.snapshot;
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
				on:click={() => (sharesValue = formatBalance(vaultShares))}
				disabled={sharesValue === formatBalance(vaultShares)}
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
				bind:value={sharesValue}
				size="xl"
				token={vaultShares}
				disabled={$redemption !== 'initial'}
				min={formatUnits(1n, vaultShares.decimals)}
				max={formatBalance(vaultShares)}
			>
				Estimated value
				<EntitySymbol label={denominationToken.label} logoUrl={getLogoUrl('token', denominationToken.symbol)}>
					{formatNumber(estimatedValue, 2, 4)}
					{denominationToken.label}
				</EntitySymbol>
			</MoneyInput>

			{#if $redemption === 'initial'}
				<Button submit disabled={!sharesValue}>Redeem</Button>

				{#if vault.inKindRedemption || vault.requiresSettlement()}
					<AlertList size="sm" status="warning" let:AlertItem>
						{#if vault.inKindRedemption}
							<AlertItem title="Shares redeemed in-kind">
								You will receive a portion of all tokens held by this strategy, in proportion to the number of shares
								you are redeeming relative to the total strategy assets.
							</AlertItem>
						{/if}

						{#if vault.requiresSettlement()}
							<AlertItem title="Settlement period required">
								Your redemption will show as <i>pending</i> during settlement. Once complete, you'll be able to claim
								your redeemed tokens.
								<a href={vault.settlementInfoUrl} target="_blank" rel="noreferrer">Learn more about settlement</a>
							</AlertItem>
						{/if}
					</AlertList>
				{/if}
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
					{transactionCopy}
				</Alert>
			{/if}

			{#if $redemption === 'failed'}
				<Alert size="sm" status="error" title="Error">
					<RedemptionError {error} symbol={denominationToken.symbol} {transactionCopy} />
					<Button slot="cta" size="sm" label="Try again" on:click={redemption.retry} />
				</Alert>
			{/if}

			{#if $redemption === 'completed'}
				<Alert size="sm" status="success" title="Redemption {vault.requiresSettlement() ? 'initiated' : 'completed'}">
					{#if vault.requiresSettlement()}
						Your transaction completed successfully. Your tokens will be available to claim once the settlement period
						is complete.
					{:else}
						Your transaction completed successfully and the redeemed tokens have been added to your wallet.
					{/if}
					Click "Next" below to review your redemption details.
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
