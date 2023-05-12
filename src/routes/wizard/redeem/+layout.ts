export async function load() {
	const title = 'Deposit tokens';
	const steps = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'deposit-status', label: 'Deposit status' },
		{ slug: 'share-redemption', label: 'Share redemption' },
		{ slug: 'success', label: 'Success' }
	];
	return { title, steps };
}
