import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VaultSparkline from './VaultSparkline.svelte';

afterEach(cleanup);

vi.mock('./helpers', () => ({
	getVaultSparklineUrl: (vault: { id: string }) => `https://sparklines.example/sparkline-90d-${vault.id}.svg`
}));

describe('VaultSparkline', () => {
	it('declares the intrinsic image size so rows do not shift while the sparkline loads', () => {
		const { container } = render(VaultSparkline, { vault: { id: '42', name: 'Test vault' } });

		const img = container.querySelector('img');
		expect(img).not.toBeNull();
		expect(img?.getAttribute('width')).toBe('72');
		expect(img?.getAttribute('height')).toBe('18');
		expect(img?.getAttribute('loading')).toBe('lazy');
		expect(img?.getAttribute('decoding')).toBe('async');
		expect(img?.getAttribute('src')).toBe('https://sparklines.example/sparkline-90d-42.svg');
	});

	it('renders the fallback text when hideUnavailable is not set and the image fails', async () => {
		const { container } = render(VaultSparkline, { vault: { id: '7', name: 'Broken vault' } });

		const img = container.querySelector('img');
		img?.dispatchEvent(new Event('error'));
		await Promise.resolve();

		expect(container.textContent).toContain('chart unavailable');
	});
});
