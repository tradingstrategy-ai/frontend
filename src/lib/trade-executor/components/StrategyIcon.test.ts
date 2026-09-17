import { render } from '@testing-library/svelte';
import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import StrategyIcon from './StrategyIcon.svelte';

const baseStrategy = { id: 'hyper-ai', connected: true, icon_url: undefined } as unknown as StrategyInfo;

describe('StrategyIcon component', () => {
	test('renders the bundled avatar with intrinsic dimensions', () => {
		const { container } = render(StrategyIcon, { strategy: baseStrategy });
		const img = container.querySelector('img')!;
		expect(img.getAttribute('src')).toBe('/avatars/hyper-ai.svg');
		expect(img.getAttribute('width')).toBe('128');
		expect(img.getAttribute('height')).toBe('128');
		expect(container.querySelector('source[type="image/webp"]')?.getAttribute('srcset')).toBe('/avatars/hyper-ai.webp');
	});

	test('uses the remote icon for strategies that are not connected, upgraded to https', () => {
		const strategy = { ...baseStrategy, connected: false, icon_url: 'http://example.com/icon.png' } as StrategyInfo;
		const { container } = render(StrategyIcon, { strategy });
		const img = container.querySelector('img')!;
		expect(img.getAttribute('src')).toBe('https://example.com/icon.png');
		expect(img.getAttribute('width')).toBe('128');
	});

	test('shows the outdated marker instead of an image', () => {
		const strategy = { ...baseStrategy, newVersionId: 'hyper-ai-2' } as StrategyInfo;
		const { container } = render(StrategyIcon, { strategy });
		expect(container.querySelector('img')).toBeNull();
		expect(container.textContent).toContain('outdated');
	});
});
