export async function load() {
	const title = 'Deposit tokens';
	const steps = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'balance', label: 'Wallet balance' },
		{ slug: 'payment', label: 'Payment' },
		{ slug: 'finish', label: 'Finish' }
	];
	return { title, steps };
}
