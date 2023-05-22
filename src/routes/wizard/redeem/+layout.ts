export async function load() {
	const title = 'Redeem tokens';
	const steps = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'deposit-status', label: 'Deposit status' },
		{ slug: 'shares-redemption', label: 'Shares redemption' },
		{ slug: 'success', label: 'Success' }
	];
	return { title, steps };
}
