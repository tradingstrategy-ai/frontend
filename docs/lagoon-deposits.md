# Lagoon deposits and redemptions

How the async deposit and redemption flow of Lagoon vaults (`asset_management_mode: lagoon`)
behaves from the frontend's point of view, what the "My deposits" panel can and cannot tell the
user, and how to recover a request that the vault will not settle on its own. Contract references
are to Lagoon v0.5.0 in `web3-ethereum-defi` (`contracts/lagoon-v0/src/v0.5.0/`); the executor
side is documented in trade-executor's `.claude/docs/lagoon-treasury-settlement.md`.

## Request lifecycle

Lagoon is an ERC-7540 vault: deposits and redemptions are requested, sit in a pending silo, and
are turned into shares (or assets) only when the vault's Safe settles them against a posted
valuation (NAV). Each request carries the deposit epoch id at the time it was made.

| State                 | On-chain condition                                                      | What the user can do                        |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| Cancellable           | `lastDepositRequestId[user] == depositEpochId` (no NAV posted since)    | `cancelRequestDeposit()` — assets come back |
| Locked for settlement | a NAV has been posted (`updateNewTotalAssets`), request not yet settled | nothing — wait for `settleDeposit`          |
| Settled / claimable   | `claimableDepositRequest(0, user) > 0`                                  | `deposit()` to claim shares                 |

The transition from _cancellable_ to _locked_ is `_updateNewTotalAssets()`: it bumps
`depositEpochId += 2` whenever the silo holds pending assets. `cancelRequestDeposit()` then reverts
with `RequestNotCancelable(requestId)` (`ERC7540.sol`, `cancelRequestDeposit`). Nothing — not the
user, not the vault owner — can move a locked request back; the silo's assets only leave through
`settleDeposit()` or a cancellation that is no longer allowed.

The same shape applies to redemptions (`redeemEpochId`, `settleRedeem`).

## Why a request gets stuck

The trade-executor posts a NAV on **every** treasury sync, whether or not it can settle. Settlement
itself goes through TradingStrategyModuleV0, where GuardV0 caps the gross deposit + redemption flow
an asset manager may settle automatically (see the GuardV0 section in
[exchange-account-strategies.md](exchange-account-strategies.md); the live budget is published in
`/metadata` under `on_chain_data.smart_contracts.lagoon_guard_v0`).

So a single request larger than the cap — e.g. 9,991.89 USDC against a 5,000 USDC / 24 h budget —
is locked by the next NAV post and can never settle automatically, not even after the window
resets. It stays _locked for settlement_ until the Safe owners settle it directly.

## How it is resolved

Only direct Safe governance can settle an over-budget queue; `trade-executor lagoon-settle` uses the
same Guard-capped module and is rejected. The procedure (from the executor docs):

1. Run `trade-executor lagoon-manual-settle` in the executor environment. It reads the posted but
   unsettled raw `_newTotalAssets` (from `NewTotalAssetsUpdated` / `TotalAssetsUpdated` events on
   v0.5.0, which has no getter), chooses `settleDeposit` or `settleRedeem`, simulates it as the Safe
   and prints Gnosis Safe Transaction Builder instructions. The executor also logs an `ERROR` with
   the same payload each time it skips an over-budget settlement.
2. Safe owners submit `settleDeposit(uint256 _newTotalAssets)` on the vault from the Safe, using the
   exact raw NAV from step 1 (never the current `totalAssets()`), and collect the threshold of
   signatures.
3. Once executed, the request is claimable and the panel shows **Claim shares**. The next executor
   sync records the inflow.

A user who wants the assets back rather than shares must claim, then request a redemption — which,
if it is also over the cap, needs the same Safe `settleRedeem` route.

## What the frontend shows

`LagoonVault.getPendingDeposit()` (`src/lib/trade-executor/vaults/lagoon/index.ts`) reads
`pendingDepositRequest` and `claimableDepositRequest` and reports `settled = claimable > 0`. It does
**not** distinguish _cancellable_ from _locked for settlement_, so `PendingExchangeInfo.svelte`
offers **Cancel deposit** for both, and for a locked request the click ends in the revert above.

Errors from wallet and contract actions are rendered with `describeError()`
(`src/lib/eth-defi/helpers.ts`), which appends the decoded revert reason to viem's short message —
`The contract function "cancelRequestDeposit" reverted: RequestNotCancelable(3)` — so a
contract-level rejection is distinguishable from a wallet failure. Without it viem's
`shortMessage` only says that the function reverted.

Known gaps, in order of value:

- detect the locked state when loading the pending request (simulate `cancelRequestDeposit` from
  the user's address; `RequestNotCancelable` means locked) and replace the button with an
  "awaiting settlement" note that mentions the automated limit and manual settlement;
- warn before a deposit above `remaining_automatic_settlement_budget` that it will need manual
  settlement by the vault's Safe.

## Diagnosing a stuck request by hand

With viem and a mainnet RPC, from the user's address:

```ts
await client.simulateContract({ address: vault, abi, functionName: 'cancelRequestDeposit', account });
// → ContractFunctionExecutionError, cause.data.errorName === 'RequestNotCancelable'
await client.readContract({ address: vault, abi, functionName: 'pendingDepositRequest', args: [0n, account] }); // assets waiting
await client.readContract({ address: vault, abi, functionName: 'claimableDepositRequest', args: [0n, account] }); // 0 until settled
```

`isTotalAssetsValid()` returning `false` while a request is pending means a NAV has been posted and
is waiting for settlement. The epoch counters and the silo address are not public getters in v0.5.0.
