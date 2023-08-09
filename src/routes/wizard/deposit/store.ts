import { createWizardStore } from 'wizard/store';

export default createWizardStore('deposit', 'Deposit tokens', [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'balance', label: 'Wallet balance' },
	{ slug: 'payment', label: 'Payment' },
	{ slug: 'success', label: 'Success' }
]);
