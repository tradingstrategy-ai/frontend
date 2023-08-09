import { createWizardStore } from 'wizard/store';

export default createWizardStore('redeem', 'Deposit tokens', [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'deposit-status', label: 'Deposit status' },
	{ slug: 'shares-redemption', label: 'Shares redemption' },
	{ slug: 'success', label: 'Success' }
]);
