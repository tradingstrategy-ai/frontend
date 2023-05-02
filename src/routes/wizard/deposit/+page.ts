import { redirect } from '@sveltejs/kit';
import wizard from '../wizardState';

export async function load({ parent, url }) {
	await parent();

	const q = url.searchParams;
	const returnTo = q.get('returnTo') ?? '/';
	const chainId = q.get('chainId');
	const requestedChainId = chainId?.match(/^\d+$/) && Number(chainId);

	wizard.initialize(returnTo, { requestedChainId });
	throw redirect(307, 'deposit/introduction');
}
