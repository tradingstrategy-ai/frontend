import { describe, expect, test } from 'vitest';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import {
	DEFAULT_COMPARE_TITLE,
	getSelectedCompareVaults,
	getVaultCompareMeta,
	getVaultCompareTitle
} from './compare-meta';

function vault(id: string, name: string): VaultInfo {
	return { id, name } as VaultInfo;
}

describe('vault compare metadata', () => {
	const vaults = [
		vault('first', 'First Vault'),
		vault('second', 'Second Vault'),
		vault('third', 'Third Vault'),
		vault('fourth', 'Fourth Vault'),
		vault('fifth', 'Fifth Vault')
	];

	test('uses the default title when no vaults are requested', () => {
		expect(getVaultCompareTitle([], 0)).toBe(DEFAULT_COMPARE_TITLE);
	});

	test('builds title for one selected vault', () => {
		expect(getVaultCompareTitle([vaults[0]], 1)).toBe('Compare First Vault and other vaults');
	});

	test('builds title for up to four selected vaults', () => {
		expect(getVaultCompareTitle(vaults.slice(0, 2), 2)).toBe('Compare vault First Vault and Second Vault');
		expect(getVaultCompareTitle(vaults.slice(0, 3), 3)).toBe('Compare vault First Vault, Second Vault and Third Vault');
		expect(getVaultCompareTitle(vaults.slice(0, 4), 4)).toBe(
			'Compare vault First Vault, Second Vault, Third Vault and Fourth Vault'
		);
	});

	test('uses "and others" when more than four vault IDs are requested', () => {
		expect(getVaultCompareTitle(vaults, 5)).toBe('Compare First Vault and others');
	});

	test('resolves selected vaults in URL order', () => {
		const selected = getSelectedCompareVaults(new URLSearchParams('vault=third&vault=first&vault=missing'), vaults);

		expect(selected.map(({ id }) => id)).toEqual(['third', 'first']);
	});

	test('uses the first selected vault sparkline for social metadata', () => {
		const meta = getVaultCompareMeta(new URLSearchParams('vault=second&vault=first'), vaults);

		expect(meta.title).toBe('Compare vault Second Vault and First Vault');
		expect(meta.selectedVaultIds).toEqual(['second', 'first']);
		expect(meta.image).toBeTruthy();
		expect(meta.imageAlt).toBe('Second Vault preview image');
	});
});
