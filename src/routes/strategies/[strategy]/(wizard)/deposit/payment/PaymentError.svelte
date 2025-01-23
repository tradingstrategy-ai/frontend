<!--
@component
Displays relevant user-facing error message based on the type of payment error encountered.render

@example
```svelte
  <PaymentError
    error={paymentError}
    symbol={denominationToken.symbol}
    transactionCopy="See tx info above"
  >
```
-->
<script lang="ts">
	import { type ErrorInfo, errorCausedBy } from '$lib/eth-defi/helpers';

	export let error: ErrorInfo | any;
	export let symbol: string;
	export let transactionCopy: string;

	const causedBy = errorCausedBy.bind(null, error);

	const state = error.state ?? 'unknown';
	const authorizingOrApproving = ['authorizing', 'approving'].includes(state);
	const processing = state.startsWith('processing');
	const confirming = state === 'confirming';
</script>

{#if causedBy('NavigationLostStateError')}
	Wallet request state lost due to window navigation; please cancel the request in your wallet and try again.
{:else if authorizingOrApproving}
	{#if causedBy('UserRejectedRequestError')}
		Authorization to transfer {symbol} tokens from your wallet was refused by user. To proceed with share purchase, please
		try again and approve the request.
	{:else if error.name === 'UnknownRpcError' && error.details.includes('eth_signTypedData_v4')}
		Authorization failed because your wallet does not support typed data signatures. Consider using TrustWallet, Rainbow
		or a browser extension wallet like MetaMask.
	{:else}
		Authorization to transfer {symbol} tokens from your wallet failed.
		{error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
	{/if}
{:else if confirming}
	{#if causedBy('GetSharePriceError')}
		Error fetching share price; unable to calculate minSharesQuantity. Aborting payment contract request.
	{:else if causedBy('UserRejectedRequestError')}
		Request to buy shares using your wallet was refused by user. To proceed with share purchase, please try again and
		approve the request.
	{:else}
		Payment confirmation from wallet account failed.
		{error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
	{/if}
{:else if processing}
	{error.shortMessage ?? error.details ?? 'Unable to verify transaction status.'}
	{transactionCopy}
{:else}
	An unexpected error occurred during "{state}" step.
	{error.name}: {error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
{/if}
