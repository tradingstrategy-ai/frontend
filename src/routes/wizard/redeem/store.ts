import wizardStore from 'wizard/store';

export default wizardStore('redeem', 'Deposit tokens', [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'deposit-status', label: 'Deposit status' },
	{ slug: 'shares-redemption', label: 'Shares redemption' },
	{ slug: 'success', label: 'Success' }
]);
