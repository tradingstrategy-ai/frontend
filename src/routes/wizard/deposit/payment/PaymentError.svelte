<script lang="ts">
	import type { ErrorInfo, TokenInfo, GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';

	export let error: ErrorInfo | any;
	export let denominationToken: TokenInfo | GetTokenBalanceReturnType;
	export let viewTransactionCopy: string;

	// TODO: move this (and generic `walk` function) to an `error` helper
	// walk the error's causes and return true if any match the provided error name
	function causedBy(name: string, err: any = error) {
		if (err?.name === name) return true;
		if (err?.cause) return causedBy(name, err.cause);
		return false;
	}
</script>

{#if error.state === 'authorizing'}
	{#if causedBy('UserRejectedRequestError')}
		Authorization to transfer {denominationToken.symbol} tokens from your wallet was refused. To proceed with share purchase,
		please try again and accept the signature request.
	{:else if error.name === 'UnknownRpcError' && error.details.includes('eth_signTypedData_v4')}
		Authorization failed because your wallet does not support typed data signatures. Consider using TrustWallet, Rainbow
		or a browser extension wallet like MetaMask.
	{:else if causedBy('NavigationLostStateError')}
		Authorization request lost due to window navigation; please cancel wallet request and try again.
	{:else}
		Authorization to transfer {denominationToken.symbol} tokens from your wallet failed.
		{error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
	{/if}
{/if}

{#if error.state === 'approving'}
	{#if causedBy('UserRejectedRequestError')}
		Approval for {denominationToken.symbol} spending cap was refused. To proceed with share purchase, please try again and
		approve the request.
	{:else if causedBy('NavigationLostStateError')}
		Approval request lost due to window navigation; please cancel wallet request and try again.
	{:else}
		Approval for {denominationToken.symbol} spending cap failed.
		{error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
	{/if}
{/if}

{#if error.state === 'confirming'}
	{#if causedBy('GetSharePriceError')}
		Error fetching share price; unable to calculate minSharesQuantity. Aborting payment contract request.
	{:else if causedBy('NavigationLostStateError')}
		Payment request lost due to window navigation; please cancel wallet request and try again.
	{:else}
		Payment confirmation from wallet account failed.
		{error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
	{/if}
{/if}

{#if error.state.startsWith('processing')}
	{#if error.name === 'CallExecutionError'}
		{error.shortMessage} {viewTransactionCopy}
	{:else if error.name === 'TransactionRevertedError'}
		Transaction execution reverted. {viewTransactionCopy}
	{:else}
		Unable to verify transaction status. {viewTransactionCopy}
	{/if}
{/if}
