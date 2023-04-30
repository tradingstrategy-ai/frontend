import { redirect } from '@sveltejs/kit';
import wizard from '../wizardState';

export async function load({ parent, url }) {
	await parent();
	const returnTo = url.searchParams.get('returnTo') ?? '/';

	wizard.initialize(returnTo);
	throw redirect(307, 'deposit/introduction');
}
