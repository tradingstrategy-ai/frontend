/**
 * Token tax help code.
 *
 * Parse the server-side token tax information to something UI presentible.
 *
 * https://tradingstrategy.ai/docs/programming/token-tax.html
 */

/**
 * Token tax help to be rendered in the UI;
 */
export interface TokenTax {

    /* This token could not be trade for any reason*/
    measurementIssue: boolean;

    /* This token could not be trade because lack of liquidity and thus we do not know the tax*/
    liquidityIssue: boolean;

    /* This token cannot be traded for non-liquidity reason*/
    broken: boolean;


    /** Maximum value of any tax */
    maxTax: number;

    buyTax: number;
    transferTax: number;
    sellTax: number;

}

export function formatTokenTaxPercent(n: number): string {
    return (n * 100).toLocaleString("en",  {minimumFractionDigits: 1, maximumFractionDigits: 1}) + "%";
}


/**
 * @param details As returned by /pairs endpoint.
 */
export function getTokenTaxInformation(details): TokenTax {

    const liquidityIssue = (details.buy_tax == 999) || (details.sell_tax == 999) || (details.transfer_tax == 99);
    const measurementIssue = (details.buy_tax > 1) || (details.sell_tax > 1) || (details.transfer_tax > 1);
    const broken = measurementIssue && !liquidityIssue;

    return {
        broken,
        measurementIssue,
        liquidityIssue,
        maxTax: Math.max(details.buy_tax, details.sell_tax, details.transfer_tax),
        buyTax: details.buy_tax,
        transferTax: details.transfer_tax,
        sellTax: details.sell_tax
    }
}