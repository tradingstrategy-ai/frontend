/**
 * Chain checks. Enables routes to verify if data is valid for a given chain.
 */
import { CustomError } from 'ts-custom-error';
import { assert } from 'assert-ts';

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
		Object.defineProperty(this, 'name', { value: 'ChainInMaintenance' });
	}
}

/**
 * Throw an error and interrupt page loading if we detect we are on a page with maintenance data.
 * Then this will be caught in __error.svelte.
 */
export function checkChainMaintenance(chainsUnderMaintenance: any, chainSlug: string) {
	console.log('Checking ', chainSlug);

	assert(chainSlug, 'Cannot check maintenance mode against undefined chain slug');

	if (chainSlug in chainsUnderMaintenance) {
		throw new ChainInMaintenance(chainsUnderMaintenance[chainSlug]);
	}
}
