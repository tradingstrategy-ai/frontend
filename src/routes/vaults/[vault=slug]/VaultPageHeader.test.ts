import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import VaultPageHeader from './VaultPageHeader.svelte';

test('uses Fira for the migrated Euler vault while preserving its protocol metadata', () => {
	const vault = createTestVault('vi-usdc-qa-g', {
		protocol: 'Euler',
		protocol_slug: 'euler',
		link: 'https://app.euler.finance/earn/0xd80C3E98c9093b41645c07c2B6D956136F89559b?network=146'
	});

	render(VaultPageHeader, { props: { vault } });

	expect(screen.getByRole('link', { name: 'View on Fira' })).toHaveAttribute(
		'href',
		'https://app.fira.money/market/busd0-usd0?type=variable'
	);
});
