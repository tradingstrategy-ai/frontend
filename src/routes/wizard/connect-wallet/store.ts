import wizardStore from 'wizard/store';

export default wizardStore('connect-wallet', 'Connect wallet', [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'balance', label: 'Wallet balance' },
	{ slug: 'success', label: 'Success' }
]);
