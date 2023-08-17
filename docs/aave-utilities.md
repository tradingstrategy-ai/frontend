# Aave Utilities documentation

Currently, the [`lending-reserves`](https://tradingstrategy.ai/api/explorer/#/Lending%20protocol/web_lending_reserves)
and [`lending-reserve/details`](https://tradingstrategy.ai/api/explorer/#/Lending%20protocol/web_lending_reserve_details)
APIs include a raw Aave reserve snapshot as `additional_details.aggregated_reserve_data`.

This raw data requires format transformations and converstion of monetary values to USD
in order to be displayed to users. The [`@aave/math-utils`](https://www.npmjs.com/package/@aave/math-utils)
package from [Aave Utilities](https://github.com/aave/aave-utilities/) is required for
these conversions.

The documentation for this package is sparse. This document is intended to help Trading
Strategy developers make use of the module and the converted data it provides.

## Installation & Usage

[`@aave/math-utils`](https://www.npmjs.com/package/@aave/math-utils) has a peer
depenedency on [`bignumber.js`](https://www.npmjs.com/package/bignumber.js)
so it's important that both are installed as production/runtime dependencies:

```bash
npm i @aave/math-utils bignumber.js
```

The main conversion functions we're using are found in
[`formatters/reserve/index.ts`](https://github.com/aave/aave-utilities/blob/master/packages/math-utils/src/formatters/reserve/index.ts).
Given the package's sparse documentation, reading through the code is currently the best
way to understand the available conversion functions and data types.

Assuming you have a lending reserve resource returned by the Trading Strategy API, you
can get formatted USD values with `formatReserveUSD`:

```javascript
import { formatReserveUSD } from `@aave/math-utils`;

// assume `reserve` has been fetched from API

const details = reserve.additional_details;

const reserveData = details.aggregated_reserve_data;
// convert `decimals` property to `number` (see below)
reserveData.decimals &&= Number(reserveData.decimals);

const baseCurrency = details.base_currency_info;
// convert currency unit to decimals - e.g., 1_000_000 -> 8 decimals
const marketReferencePriceInUsd = baseCurrency.marketReferenceCurrencyPriceInUsd;
const marketReferenceCurrencyDecimals = Math.log10(baseCurrency.marketReferenceCurrencyUnit);

const formattedData = formatReserveUSD({
	reserve: reserveData,
	currentTimestamp: Date.now() / 1000,
	marketReferencePriceInUsd,
	marketReferenceCurrencyDecimals
});
```

> **Note**
> The `aggregated_reserve_data` object from the API payload currently represents all
> numeric properties as strings to prevent loss of precision. `@aave/math-utils` expects
> _some_ values to be `number` type (e.g., `decimal` properties). These values must be
> converted before passing the object into `formatReserveUSD`. See
> [`ReserveData`](https://github.com/search?q=repo%3Aaave%2Faave-utilities+path%3Apackages%2Fmath-utils%2Fsrc%2Fformatters%2Freserve+ReserveData&type=code)
> type.

## Data Dictionary

The table below documents key properties of the object returned by
`formatReserveUSD`. See `FormatReserveResponse` and `FormatReserveUSDResponse` in
[`formatters/reserve/index.ts`](https://github.com/aave/aave-utilities/blob/master/packages/math-utils/src/formatters/reserve/index.ts).

Many of these properties are available in two variants:

- Reference currency value – e.g., `totalLiquidity`
- USD value – e.g., `totalLiquidityUSD`

| Human Label                                   | Property or Formula                                       | Description                                                     |
| --------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| Total&nbsp;Supplied _or_<br>Reserve&nbsp;Size | `totalLiquidity`<br/>`totalLiquidityUSD`                  | Total value of tokens supplied to the reserve                   |
| Total&nbsp;Borrowed                           | `totalDebt`<br/>`totalDebtUSD`                            | Total value of tokens currently borrowed                        |
| Available&nbsp;Liquidity                      | `formattedAvailableLiquidity`<br/>`availableLiquidityUSD` | Value of supplied tokens available for borrowing                |
| Utilization&nbsp;Rate                         | `supplyUsageRatio`                                        | Percentage of supply that has been borrowed                     |
| Supply&nbsp;Cap                               | `supplyCap`<br/>`supplyCapUSD`                            | Maximum value that can be supplied to the reserve               |
| Borrow&nbsp;Cap                               | `borrowCap`<br/>`borrowCapUSD`                            | Maximum value that can be borrowed from the reserve             |
| Asset&nbsp;Token&nbsp;Price                   | `priceInUSD`                                              | Current price of asset token in USD                             |
| Borrowing&nbsp;Enabled                        | borrowingEnabled                                          | Flag indicating if borrowing disabled due to community decision |
| Stable&nbsp;Borrow&nbsp;Rate&nbsp;Enabled     | stableBorrowRateEnabled                                   | Flag indicating if stable borrow rate can be used               |
| Usage&nbsp;as&nbsp;Collateral&nbsp;Enabled    | usageAsCollateralEnabled                                  | Flag indicating if reserve asset can be used as collateral      |
| Flash&nbsp;Loan&nbsp;Enabled                  | flashLoanEnabled                                          | Flag indicating if flash loans are enabled                      |
