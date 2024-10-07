<script lang="ts">
	import type { DepositWizardData } from '../+layout.js';
	import { captureException } from '@sentry/sveltekit';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';
	import { inview } from 'svelte-inview';
	import { wizard } from 'wizard/store';
	import { hashMessage, numberToHex } from 'viem';
	import { signMessage, simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
	import { config, wallet, WalletAddress } from '$lib/wallet';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain';
	import termsOfServiceABI from '$lib/eth-defi/abi/TermsOfService.json';
	import { Alert, Button, CryptoAddressWidget, Dialog, SummaryBox } from '$lib/components';
	import IconReading from '~icons/local/reading';
	import IconDownload from '~icons/local/download';
	import IconFullscreen from '~icons/local/fullscreen';

	export let data;
	const { canProceed, version, fileName, tosText, acceptanceMessage } = data;

	const { chainId, contracts, tosHash, tosSignature, canForwardPayment } = $wizard.data as DepositWizardData;
	const chain = getChain(chainId)!;

	const progressBar = tweened(0, { easing: cubicOut });
	const viewTransactionCopy = 'Click the transaction ID above to view the status in the blockchain explorer.';

	let fullScreen = false;
	let transactionId: Maybe<Address>;
	let errorMessage: MaybeString;

	async function recordSignature(tosHash: Address, tosSignature: Address) {
		const { request } = await simulateContract(config, {
			address: contracts.terms_of_service!,
			abi: termsOfServiceABI,
			functionName: 'signTermsOfServiceOwn',
			// TODO: include metadata arg? (use viem `toHex`)
			args: [tosHash, tosSignature, '']
		});

		return writeContract(config, request);
	}

	const tos = fsm('initial', {
		initial: {
			validate() {
				if (fileName && tosText && acceptanceMessage && Number.isFinite(version)) {
					return 'valid';
				}
				return 'invalid';
			}
		},

		valid: {
			restore(tosPreviouslyAccepted: boolean, tosSignature?: string, tosHash?: string) {
				// setting dummy signature/hash values since ToS has already been accepted
				if (tosPreviouslyAccepted) {
					wizard.updateData({
						tosSignature: '',
						tosHash: numberToHex(0, { size: 32 })
					});
				}

				if (tosPreviouslyAccepted || (tosSignature && tosHash)) {
					return 'completed';
				}
			},

			checkDeviceType({ innerWidth }) {
				// bypass scoll check for mobile users
				if (innerWidth <= 576) return 'ready';
			},

			finishReading: 'ready'
		},

		ready: {
			sign() {
				signMessage(config, { message: acceptanceMessage! }).then(tos.continue).catch(tos.fail);
				return 'signing';
			}
		},

		signing: {
			_enter() {
				fullScreen = false;
			},

			continue(tosSignature) {
				const tosHash = hashMessage(acceptanceMessage!);

				if (canForwardPayment) {
					wizard.updateData({ tosSignature, tosHash });
					return 'completed';
				}

				recordSignature(tosHash, tosSignature).then(tos.process).catch(tos.fail);
				return 'recording';
			},

			fail(err: Error) {
				if (err.name === 'UserRejectedRequestError') {
					errorMessage = 'Signature request rejected by user. Please try again and accept the request.';
				} else {
					errorMessage = err.message ?? String(err);
				}
				return 'failed';
			}
		},

		recording: {
			process(txId) {
				transactionId = txId;
				return 'processing';
			},

			fail(err: Error) {
				// edge case: user already signed but state was lost; continue to completed state
				if (err.name === 'ContractFunctionExecutionError' && err.message.includes('Already signed')) {
					return 'completed';
				}

				if (err.name === 'ContractFunctionExecutionError' && err.message.includes('User rejected')) {
					errorMessage = 'Transaction request rejected by user. Please try again and accept the request.';
				} else {
					errorMessage = err.message ?? String(err);
				}
				return 'failed';
			}
		},

		processing: {
			_enter() {
				waitForTransactionReceipt(config, { hash: transactionId! }).then(tos.finish).catch(tos.fail);
				progressBar.set(100, { duration: 20_000 });
			},

			_exit() {
				progressBar.set(100, { duration: 100 });
			},

			finish(receipt) {
				if (receipt.status === 'success') return 'completed';

				console.error('waitForTransactionReceipt reverted:', receipt);
				errorMessage = `Transaction execution reverted. ${viewTransactionCopy}`;
				return 'failed';
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
			}
		},

		failed: {
			retry: 'ready'
		},

		completed: {
			_enter() {
				wizard.toggleComplete('tos');
			}
		},

		invalid: {}
	});

	tos.validate();
	tos.restore(canProceed, tosHash, tosSignature);
	tos.checkDeviceType(window);
</script>

<div class="deposit-tos">
	{#if $tos === 'invalid'}
		<Alert size="md" status="error" title="Error">
			Terms of service v{version} file not found
		</Alert>
	{:else if !acceptanceMessage}
		<Alert size="md" status="error" title="Error">
			Terms of service v{version} acceptance message not found in
			<code>acceptance-messages.json</code>
		</Alert>
	{/if}

	<SummaryBox>
		<header slot="header" class="tos-header">
			<h2>Version {version}</h2>
			<div class="cta">
				<Button
					size="xs"
					label="Download"
					disabled={!tosText}
					href="/tos/{fileName}"
					download="Trading Strategy ToS v{version}-{fileName}"
				>
					<IconDownload slot="icon" />
				</Button>
				<Button size="xs" label="Fullscreen" disabled={!tosText} on:click={() => (fullScreen = true)}>
					<IconFullscreen slot="icon" />
				</Button>
			</div>
		</header>
		<pre class="tos-text in-doc-flow" class:no-file={!tosText}>
			{#if tosText}
				{tosText}
				<div class="scroll-check" use:inview on:inview_enter={tos.finishReading} />
			{:else}
				Terms of service file not found:
  			&gt; src/lib/assets/tos/{fileName}
			{/if}
		</pre>
	</SummaryBox>

	{#if ['initial', 'valid', 'ready'].includes($tos)}
		<form on:submit|preventDefault={tos.sign}>
			<Button label="Sign terms with your wallet" disabled={$tos !== 'ready'} />
			{#if $tos === 'valid'}
				<div class="tooltip">
					<IconReading --icon-size="1.5rem" />
					Please read to the end!
				</div>
			{/if}
		</form>
	{/if}

	{#if $tos === 'signing'}
		<Alert size="sm" status="info" title="Signature request">
			To accept the terms and conditions, please confirm the signature request in your wallet.
		</Alert>
	{/if}

	{#if $tos === 'recording'}
		<Alert size="sm" status="info" title="Record signature">
			Confirm transaction request in your wallet to record Terms of Service acceptance on {chain.name} blockchain.
		</Alert>
	{/if}

	{#if transactionId}
		<div class="transaction-id">
			<h3>Transaction ID</h3>
			<CryptoAddressWidget address={transactionId} href={getExplorerUrl($wallet.chain, transactionId)} />
		</div>

		<progress max="100" value={$progressBar} />
	{/if}

	{#if $tos === 'processing'}
		<Alert size="sm" status="info" title="Transaction processing">
			The duration of processing may vary based on factors such as blockchain congestion and gas specified.
			{viewTransactionCopy}
		</Alert>
	{/if}

	{#if $tos === 'failed'}
		<Alert size="sm" status="error" title="Error">
			{errorMessage}
			<Button slot="cta" size="sm" label="Try again" on:click={tos.retry} />
		</Alert>
	{/if}

	{#if $tos === 'completed'}
		<Alert size="sm" status="success" title="Terms accepted">
			Terms of service v{version} accepted
			{#if $wallet.isConnected}
				by wallet <WalletAddress size="sm" wallet={$wallet} />
			{/if}
		</Alert>
	{/if}

	<Dialog fullScreen title="Terms of Service" bind:open={fullScreen}>
		<span slot="title" class="dialog-title">
			Terms of Service
			<small>(v{version})</small>
		</span>
		<pre class="tos-text in-dialog">
			{tosText}
			<div class="scroll-check" use:inview on:inview_enter={tos.finishReading} />
		</pre>
		<footer slot="footer" class="dialog-footer">
			{#if $tos === 'completed'}
				<Alert size="sm" status="success" title="Terms accepted">
					Terms of service v{version} accepted
				</Alert>
			{:else}
				<form on:submit|preventDefault={tos.sign}>
					<Button size="sm" label="Sign terms with your wallet" disabled={$tos !== 'ready'} />
					{#if $tos === 'valid'}
						<div class="tooltip">
							<IconReading --icon-size="1.5rem" />
							Please read to the end!
						</div>
					{/if}
				</form>
			{/if}
		</footer>
	</Dialog>
</div>

<style>
	.deposit-tos {
		:global([data-css-props]) {
			--dialog-max-width: 100ch;
		}

		display: grid;
		gap: 2rem;

		@media (--viewport-xs) {
			gap: 1.5rem;
		}

		.tos-header {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
			align-items: center;

			h2 {
				flex: 1;
				margin: 0;
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
				color: var(--c-text-light);
				white-space: nowrap;
			}

			.cta {
				flex: 1;
				display: grid;
				grid-template-columns: auto auto;
				gap: 0.5rem;

				:global(.icon path) {
					stroke-width: 2;
				}
			}
		}

		.tos-text {
			white-space: pre-line;
			background: var(--c-text-inverted);
			overflow-y: auto;
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			line-height: 150% !important;

			@media (--viewport-xs) {
				font: var(--f-ui-xs-roman);
				letter-spacing: var(--f-ui-xs-spacing, normal);
			}

			&.in-doc-flow {
				border-radius: 1rem;
				padding: 1.25rem;
				height: calc(100vh - 34em);
				min-height: 18rem;
				max-height: 28rem;
				border: 2px solid var(--c-input-border);

				@media (--viewport-xs) {
					padding: 1rem;
					height: calc(100vh - 41em);
					min-height: 12rem;
					max-height: 24rem;
				}
			}

			.scroll-check {
				margin-top: -4rem;
			}
		}

		.no-file {
			font: var(--f-mono-md-regular);
			letter-spacing: var(--f-mono-md-spacing, normal);
			color: color-mix(in srgb, var(--c-text), var(--c-error));
		}

		form {
			position: relative;
			display: grid;

			&:not(:focus-within, :hover) .tooltip {
				display: none;
			}

			.tooltip {
				position: absolute;
				bottom: -2rem;
				width: 100%;
				font-weight: bold;
				color: var(--c-error);
				text-align: center;
			}
		}

		progress {
			width: 100%;
		}

		.transaction-id {
			display: grid;
			gap: var(--space-ss);
			justify-content: flex-start;

			h3 {
				color: var(--c-text-light);
				font: var(--f-ui-lg-medium);
				margin: 0;
			}
		}

		.dialog-title small {
			color: var(--c-text-extra-light);
			margin-left: 1ex;
		}

		.dialog-footer form {
			display: grid;

			@media (--viewport-sm-up) {
				justify-content: center;
			}

			.tooltip {
				top: -2rem;
				bottom: auto;
			}
		}
	}
</style>
