import type { VaultInfo } from '$lib/top-vaults/schemas';
import { type TestVaultProps, createTestVault } from '$lib/top-vaults/test-utils';
import { defineMock } from 'vite-plugin-mock-dev-server';

function generateMockVaults(prefix: string, count: number, props: TestVaultProps = {}): VaultInfo[] {
	const vaults: VaultInfo[] = [];
	const chains = ['ethereum', 'polygon', 'arbitrum', 'base', 'avalanche'];
	const protocols = ['Yearn', 'Aave', 'Compound', 'Morpho', 'Gearbox', 'Sommelier'];
	const denominations = ['USDC', 'USDT', 'DAI'];
	const risks = ['Negligible', 'Minimal', 'Low', 'High', 'Severe', 'Dangerous'] as const;

	for (let i = 0; i < count; i++) {
		vaults.push(
			createTestVault(`${prefix} ${String(i).padStart(3, '0')}`, {
				chain: chains[i % chains.length],
				protocol: protocols[i % protocols.length],
				denomination: denominations[i % denominations.length],
				risk: risks[i % risks.length],
				...props
			})
		);
	}

	return vaults;
}

const belowTvl = generateMockVaults('Below TVL', 50, {
	get current_nav() {
		return Math.random() * 50_000;
	}
});

const aboveTvl = generateMockVaults('Above TVL', 250, {
	get current_nav() {
		return Math.random() * 1_000_000 + 50_000;
	}
});

export default defineMock({
	url: '/api/top-vaults/vaults.json',
	body: {
		generated_at: new Date().toISOString(),
		vaults: [...belowTvl, ...aboveTvl]
	}
});
