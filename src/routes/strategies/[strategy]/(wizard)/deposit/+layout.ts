import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';
import type { WizardStep } from '$lib/wizard/WizardActions.svelte';
import { z } from 'zod';
import { hexString, hexEncodedData } from '$lib/eth-defi/schemas/core';
import { currencyBalanceSchema, tokenBalanceSchema } from '$lib/eth-defi/schemas/token';
import { config } from '$lib/wallet/client';
import { assertNotGeoBlocked } from '$lib/helpers/geo';
import { getDenominationTokenInfo } from '$lib/eth-defi/helpers';

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
	const { admin, ipCountry, chain, strategy } = await parent();
	assertNotGeoBlocked('strategies:deposit', ipCountry, admin);

	let steps: WizardStep[] = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'balance', label: 'Wallet balance' },
		{ slug: 'tos', label: 'Terms of service' },
		{ slug: 'payment', label: 'Payment' },
		{ slug: 'success', label: 'Success' }
	];

	const onChainData = strategy.on_chain_data as EnzymeOnChainData;
	const { comptroller, terms_of_service } = onChainData.smart_contracts;

	// skip "Terms of service" step if no terms_of_service contract
	if (!terms_of_service) {
		steps = steps.filter(({ slug }) => slug !== 'tos');
	}

	// get denomination token info
	const denominationTokenInfo = await getDenominationTokenInfo(config, { chainId: chain.id, comptroller });

	// USDC can forward payment using transferWithAuthorizations; other tokens can't (yet)
	const canForwardPayment = denominationTokenInfo.symbol === 'USDC';

	return {
		slug: 'deposit',
		title: 'Deposit tokens',
		steps,
		dataSchema,
		denominationTokenInfo,
		canForwardPayment
	};
}
