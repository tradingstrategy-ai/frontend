export async function load() {
	return {
		title: 'Deposit tokens',
		steps: [
			{ slug: 'introduction', label: 'Introduction' },
			{ slug: 'connect', label: 'Connect your wallet' },
			{ slug: 'balance', label: 'Wallet balance' },
			{ slug: 'payment', label: 'Payment' },
			{ slug: 'success', label: 'Success' }
		]
	};
}
