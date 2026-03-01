export async function load() {
	return {
		slug: 'connect-wallet',

		title: 'Connect wallet',

		steps: [
			{ slug: 'introduction', label: 'Introduction' },
			{ slug: 'connect', label: 'Connect your wallet' },
			{ slug: 'balance', label: 'Wallet balance' },
			{ slug: 'success', label: 'Success' }
		],

		dataSchema: undefined
	};
}
