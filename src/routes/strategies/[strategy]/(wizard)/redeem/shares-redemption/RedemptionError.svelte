<!--
@component
Displays relevant user-facing error message based on the type of redemption error encountered.

@example
```svelte
  <RedemptionError
    error={redemptionError}
    symbol={denominationToken.symbol}
    transactionCopy="See tx info above"
  >
```
-->
<script lang="ts">
	import { type ErrorInfo, errorCausedBy } from '$lib/eth-defi/helpers';

	type Props = {
		error: ErrorInfo | any;
		symbol: string;
		transactionCopy: string;
	};

	let { error, symbol, transactionCopy }: Props = $props();

	const causedBy = errorCausedBy.bind(null, error);
	const state = error.state ?? 'unknown';
</script>

{#if causedBy('NavigationLostStateError')}
	Wallet request state lost due to window navigation; please cancel the request in your wallet and try again.
{:else if state === 'confirming'}
	{#if causedBy('UserRejectedRequestError')}
		Request to redeem shares using your wallet was refused by user. To proceed with redemption, please try again and
		approve the request.
	{:else}
		Redemption confirmation from wallet account failed.
		{error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
	{/if}
{:else if state === 'processing'}
	{error.shortMessage ?? error.details ?? 'Unable to verify transaction status.'}
	{transactionCopy}
{:else}
	An unexpected error occurred during "{state}" step.
	{error.name}: {error.shortMessage ?? error.details ?? 'Failure reason unknown.'}
{/if}
