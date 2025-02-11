import type { WizardStep } from '$lib/wizard/WizardActions.svelte';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { tosContracts } from '$lib/config.js';
import { hexString } from '$lib/eth-defi/schemas/core';
import { transactionLog } from '$lib/eth-defi/schemas/transaction';
import { currencyBalanceSchema, tokenBalanceSchema } from '$lib/eth-defi/schemas/token';
import { config } from '$lib/wallet/client';
import { assertNotGeoBlocked } from '$lib/helpers/geo';

const dataSchema = z
	.object({
		nativeCurrency: currencyBalanceSchema,
		denominationToken: tokenBalanceSchema,
		tosSignature: hexString,
		tosHash: hexString,
		transactionLogs: transactionLog.array(),
		paymentSnapshot: z.record(z.any())
	})
	.partial();

export type DepositWizardDataSchema = typeof dataSchema;

export type DepositWizardData = z.infer<DepositWizardDataSchema>;

export async function load({ parent }) {
	const { admin, ipCountry, chain, vault } = await parent();
	assertNotGeoBlocked('strategies:deposit', ipCountry, admin);

	if (!vault.internalDepositEnabled()) {
		error(400, 'This strategy does not support deposits on Trading Strategy’s website.');
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

	return {
		slug: 'deposit',
		title: 'Deposit tokens',
		steps,
		dataSchema,
		vault, // re-return type-narrowed vault
		denominationTokenInfo: await vault.getDenominationTokenInfo(config),
		canForwardToS: await vault.canForwardToS(config),
		canForwardPayment: await vault.canForwardPayment(config)
	};
}
