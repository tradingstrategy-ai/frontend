import wizardStore from 'wizard/store';

export default wizardStore('deposit', 'Deposit tokens', [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'balance', label: 'Wallet balance' },
	{ slug: 'payment', label: 'Payment' },
	{ slug: 'success', label: 'Success' }
]);
