<script lang="ts">
	import fsm from 'svelte-fsm';
	import { inview } from 'svelte-inview';
	import { signMessage } from '@wagmi/core';
	import { wizard } from 'wizard/store';
	import { config, wallet, WalletAddress } from '$lib/wallet';
	import { Alert, Button, Dialog, Icon, SummaryBox } from '$lib/components';
	import { hashMessage, numberToHex } from 'viem';

	export let data;
	const { canProceed, version, fileName, tosText, acceptanceMessage } = data;

	let fullScreen = false;
	let errorMessage: MaybeString;

	const tos = fsm('initial', {
		initial: {
			validate() {
				const isValid = fileName && tosText && acceptanceMessage && Number.isFinite(version);
				return isValid ? 'valid' : 'invalid';
			}
		},

		valid: {
			restore(tosPreviouslyAccepted: boolean, { tosSignature, tosHash } = {}) {
				// setting dummy signature/hash values since ToS has already been accepted
				if (tosPreviouslyAccepted) {
					wizard.updateData({
						tosSignature: '',
						tosHash: numberToHex(0, { size: 32 })
					});
				}
				if (tosPreviouslyAccepted || (tosSignature && tosHash)) return 'accepted';
			},

			finishReading: 'ready'
		},

		ready: {
			sign() {
				signMessage(config, { message: acceptanceMessage! }).then(tos.complete).catch(tos.fail);
				return 'signing';
			}
		},

		signing: {
			complete(tosSignature) {
				const tosHash = hashMessage(acceptanceMessage!);
				wizard.updateData({ tosSignature, tosHash });
				return 'accepted';
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

		failed: {
			retry: 'ready'
		},

		accepted: {
			_enter() {
				wizard.toggleComplete('tos');
			}
		},

		invalid: {}
	});

	tos.validate();
	$: tos.restore(canProceed, $wizard.data);
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
		<header slot="header">
			<h2>Version {version}</h2>
			<div class="cta">
				<Button
					size="xs"
					icon="download"
					label="Download"
					disabled={!tosText}
					href="/tos/{fileName}"
					download="Trading Strategy ToS v{version}-{fileName}"
				/>
				<Button
					size="xs"
					icon="fullscreen"
					label="Fullscreen"
					disabled={!tosText}
					on:click={() => (fullScreen = true)}
				/>
			</div>
		</header>
		<pre class="tos-text" class:no-file={!tosText}>
			{#if tosText}
				{tosText}
				<div class="scroll-check" use:inview on:inview_enter={tos.finishReading} />
			{:else}
				Terms of service file not found:
  			&gt; src/lib/assets/tos/{fileName}
			{/if}
		</pre>
	</SummaryBox>

	<form on:submit|preventDefault={tos.sign}>
		<Button label="Sign terms with your wallet" disabled={$tos !== 'ready'} />
		{#if $tos === 'valid'}
			<div class="tooltip">
				<Icon name="reading" size="1.5rem" />
				Please read to the end!
			</div>
		{/if}
	</form>

	{#if $tos === 'signing'}
		<Alert size="sm" status="info" title="Signature request">
			To accept the terms and conditions, please confirm the signature request in your wallet.
		</Alert>
	{/if}

	{#if $tos === 'failed'}
		<Alert size="sm" status="error" title="Error">
			{errorMessage}
			<Button slot="cta" size="sm" label="Try again" on:click={tos.retry} />
		</Alert>
	{/if}

	{#if $tos === 'accepted'}
		<Alert size="sm" status="success" title="Terms accepted">
			Terms of service v{version} accepted
			{#if $wallet.isConnected}
				by wallet <WalletAddress size="sm" wallet={$wallet} />
			{/if}
		</Alert>
	{/if}

	<Dialog bind:open={fullScreen} title="Terms of service">
		<pre class="dialog tos-text">
			{tosText}
			<div class="scroll-check" use:inview on:inview_enter={tos.finishReading} />
		</pre>
	</Dialog>
</div>

<style lang="postcss">
	.deposit-tos {
		:global([data-css-props]) {
			--dialog-width: max(96vw, 25rem);
			--dialog-max-width: 64rem;
		}

		display: grid;
		gap: 2rem;

		@media (--viewport-xs) {
			gap: 1.5rem;
		}

		header[slot='header'] {
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

				:global(.button) {
					--icon-size: 1rem;
				}

				:global(svg path) {
					stroke-width: 2;
				}
			}
		}

		.tos-text {
			padding: 1.25rem;
			border-radius: 1rem;
			height: calc(100vh - 32em);
			min-height: 18rem;
			max-height: 28rem;
			white-space: pre-line;
			background: var(--c-input-background);
			border: 2px solid var(--c-input-border);
			overflow-y: auto;
			font: var(--f-text-md-regular);
			letter-spacing: var(--f-text-md-spacing, normal);

			@media (--viewport-xs) {
				padding: 1rem;
				height: calc(100vh - 34em);
				min-height: 12rem;
				max-height: 24rem;
			}

			.scroll-check {
				margin-top: -4rem;
			}
		}

		.dialog {
			height: auto;
			max-height: calc(100vh - 8.5em);
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
	}
</style>
