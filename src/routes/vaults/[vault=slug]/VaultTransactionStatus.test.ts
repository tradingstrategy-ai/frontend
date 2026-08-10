import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import VaultTransactionStatus from './VaultTransactionStatus.svelte';

describe('VaultTransactionStatus', () => {
	test('does not render for a healthy public vault', () => {
		render(VaultTransactionStatus, { props: { vault: createTestVault('Healthy public vault') } });

		expect(screen.queryByText('Transaction status')).not.toBeInTheDocument();
	});

	test('shows private instead of open for deposits that need whitelisting', () => {
		const vault = createTestVault('Private vault', {
			whitelist: { status: 'whitelisted', notes: null }
		});

		render(VaultTransactionStatus, { props: { vault } });

		expect(screen.getByText('Transaction status')).toBeInTheDocument();
		const deposits = screen.getByText('Deposits').parentElement;
		expect(deposits).toContainElement(screen.getByText('Private'));
		expect(deposits).not.toHaveTextContent('Open');
	});
});
