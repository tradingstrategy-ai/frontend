export async function load() {
	const slug = 'connect-wallet';

	const title = 'Connect wallet';

	const steps = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'balance', label: 'Wallet balance' },
		{ slug: 'success', label: 'Success' }
	];

	return { slug, title, steps };
}
