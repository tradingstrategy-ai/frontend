export async function load() {
	return {
		title: 'Connect wallet',
		steps: [
			{ slug: 'introduction', label: 'Introduction' },
			{ slug: 'connect', label: 'Connect your wallet' },
			{ slug: 'balance', label: 'Wallet balance' },
			{ slug: 'success', label: 'Success' }
		]
	};
}
