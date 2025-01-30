import type { WizardStep } from '$lib/wizard/WizardActions.svelte';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { tosContracts } from '$lib/config.js';
import { hexString, hexEncodedData } from '$lib/eth-defi/schemas/core';
import { currencyBalanceSchema, tokenBalanceSchema } from '$lib/eth-defi/schemas/token';
import { config } from '$lib/wallet/client';
import { assertNotGeoBlocked } from '$lib/helpers/geo';

const dataSchema = z
	.object({
		nativeCurrency: currencyBalanceSchema,
		denominationToken: tokenBalanceSchema,
		tosSignature: hexEncodedData,
		tosHash: hexString,
		paymentSnapshot: z.record(z.any())
	})
	.partial();

export type DepositWizardDataSchema = typeof dataSchema;

export type DepositWizardData = z.infer<DepositWizardDataSchema>;

export async function load({ parent }) {
	const { admin, ipCountry, chain, vault } = await parent();
	assertNotGeoBlocked('strategies:deposit', ipCountry, admin);

	if (!vault.depositEnabled()) {
		error(400, 'This strategy does not support deposits.');
	}

	let steps: WizardStep[] = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'balance', label: 'Wallet balance' },
		{ slug: 'tos', label: 'Terms of service' },
		{ slug: 'payment', label: 'Payment' },
		{ slug: 'success', label: 'Success' }
	];

	// skip "Terms of service" step if no ToS contract configured for the chain
	if (!(chain.slug in tosContracts)) {
		steps = steps.filter(({ slug }) => slug !== 'tos');
	}

	// get denomination token info
	const denominationTokenInfo = await vault.getDenominationTokenInfo(config);

	// USDC can forward payment using transferWithAuthorizations; other tokens can't (yet)
	const canForwardPayment = denominationTokenInfo.symbol === 'USDC';

	return {
		slug: 'deposit',
		title: 'Deposit tokens',
		steps,
		dataSchema,
		denominationTokenInfo,
		canForwardPayment,
		vault // re-return type-narrowed vault
	};
}
