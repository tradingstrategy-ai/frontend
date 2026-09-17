# Exchange account strategies

Some trade-executor strategies do not trade on-chain pairs directly. Instead the vault's Safe owns an
account on an external perpetuals exchange (GMX, Derive, Hyperliquid, Lighter) and the executor tracks
that account as a single `exchange_account` position. The frontend links such strategies to the
exchange's own public account page instead of rendering per-position detail pages.

Live examples: `gmx-ai` (GMX on Arbitrum) and `lighter-ai` (Lighter, settled on Ethereum).

## How a strategy is detected

Detection lives in `src/lib/trade-executor/helpers/exchange-account.ts` and uses two sources, in order:

1. **Strategy tags** from `/metadata`: a tag matching `exchange_account_strategy_{protocol}` (for
   example `exchange_account_strategy_derive`).
2. **Position data** from `/state`: the first position whose `pair.kind === 'exchange_account'`,
   reading `pair.other_data.exchange_protocol`.

Not every executor sets the protocol-suffixed tag. `gmx-ai` and `lighter-ai` only set the generic
`exchange_account_strategy` tag, so position data is the source that actually works for them. The
overview page and the side navigation resolve from tags synchronously and fall back to the deferred
`/state` portfolio; the positions list and position detail pages already have positions in hand.

## Account page URL

Each exchange keys its public account page differently:

| Protocol      | URL                                                 | Keyed by                                                    |
| ------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `gmx`         | `https://app.gmx.io/#/accounts/{address}`           | Lagoon Safe address                                         |
| `derive`      | `https://explorer.derive.xyz/address/{address}`     | Lagoon Safe address                                         |
| `hyperliquid` | `https://app.hyperliquid.xyz/vaults/{address}`      | Lagoon Safe address                                         |
| `lighter`     | `https://app.lighter.xyz/explorer/accounts/{index}` | Lighter account index (`other_data.exchange_subaccount_id`) |

`getExchangeAccountUrl(protocol, { address, accountId })` returns `undefined` when the identifier the
exchange needs is missing, so a Lighter strategy resolved from tags alone (no positions yet) simply
shows no link rather than a broken one.

## Which position lists link out

`exchangeSupportsPositionStatus(protocol, status)` controls which "positions" navigation entries are
replaced by the external link. GMX and Lighter only show open positions on their account pages, so
their "Closed positions" entry is hidden. Derive and Hyperliquid expose both.

## Icons

Two separate images are involved (see `docs/theme.md`):

- `static/avatars/{strategy.id}.svg` + `.webp` — the strategy's own avatar, used everywhere a strategy
  is shown (`StrategyIcon`).
- `static/avatars/{protocol}.svg` — the plain exchange brand mark shown in the "{Exchange} account" box
  on the strategy overview page.

## Lagoon GuardV0 settlement policy

Lagoon exchange-account vaults use GuardV0, which caps the gross deposit + redemption flow that can be
settled automatically. The executor reports the policy in `/metadata` under
`on_chain_data.smart_contracts.lagoon_guard_v0`, in one of two shapes depending on its version:

| Legacy (before trade-executor #1653)       | Current                                     |
| ------------------------------------------ | ------------------------------------------- |
| `daily_automatic_settlement_limit_enabled` | `automatic_settlement_window_limit_enabled` |
| `daily_automatic_settlement_limit`         | `automatic_settlement_window_limit`         |
| `settlement_cooldown_seconds`              | `settlement_window_seconds`                 |
| —                                          | `settled_amount_in_window`                  |
| —                                          | `remaining_automatic_settlement_budget`     |
| —                                          | `settlement_window_end_timestamp`           |

`lagoonGuardV0Schema` in `src/lib/trade-executor/schemas/summary.ts` accepts both and normalises the
legacy shape to the current field names. `LagoonGuardV0Flow.svelte` uses the executor's own window
accounting when present and otherwise derives it from settlement balance updates in `/state`. Keep the
legacy branch until every production executor has been upgraded.

## Adding a new exchange

1. Add the URL builder, display name and visible position statuses to `exchange-account.ts`.
2. Add `static/avatars/{protocol}.svg`.
3. Make sure the executor writes `exchange_protocol` (and an account id if the exchange needs one) to
   the pair's `other_data`.
4. Add the strategy itself to `TS_PUBLIC_STRATEGIES` and to `activeExecutors` in
   `src/lib/trade-executor/client/strategy-info.ts`, and create its avatar as described in
   `docs/theme.md`.
