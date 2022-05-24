/**
 * Chain checks.
 *
 * Routes can check if chain data is good.
 */


import { CustomError } from 'ts-custom-error'

import { chainsUnderMaintenance } from "../config";
import { assert } from "assert-ts";


/**
 * A custom error class that gives more information on which chain does not have good data..
 *
 * See https://www.npmjs.com/package/ts-custom-error for more information.
 */
export class ChainInMaintenance extends CustomError {

    public constructor(public chainName: string) {
        super(`Chain under maintenance: ${chainName}`);

        // It has been 25 years and JavaScript still does not have proper exception classes.
        // Set name explicitly as minification can mangle class names,
        // as this needs to be checked in __error.svelte.
        Object.defineProperty(this, 'name', { value: 'ChainInMaintenance' })
    }

}

/**
 * Helper function (not exported)
 *
 * Returns human-readable chain name for slug if chain is under maintenance
 */
function getChainName(chainSlug: string): string {
    return chainsUnderMaintenance[chainSlug];
}

/**
 * Check if we should not serve data pages for a certain chain due to maintenance.
 *
 * @param chainSlug E.g. "binance"
 */
export function isChainInMaintenance(chainSlug: string): boolean {
    return chainSlug in chainsUnderMaintenance;
}

/**
 * Throw an error and interrupt page loading if we detect we are on a page with maintenance data.
 *
 * Then this will be caught in __error.svelte.
 *
 * @param chainSlug
 */
export function checkChainMaintenance(chainSlug: string) {
    console.log("Checking ", chainSlug);

    assert(chainSlug, "Cannot check maintenance mode against undefined chain slug");

    if(isChainInMaintenance(chainSlug)) {
        throw new ChainInMaintenance(getChainName(chainSlug));
    }
}
