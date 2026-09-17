import { render, screen } from '@testing-library/svelte';
import MenuItem from './MenuItem.svelte';

describe('MenuItem component', () => {
	test('renders a crawlable link', () => {
		render(MenuItem, { label: 'Top vaults', targetUrl: '/vaults' });
		const link = screen.getByRole('link', { name: 'Top vaults' });
		expect(link).toHaveAttribute('href', '/vaults');
		expect(link).not.toHaveAttribute('aria-current');
	});

	test('keeps the href on the active item and marks it as the current page', () => {
		render(MenuItem, { label: 'Top vaults', targetUrl: '/vaults', active: true });
		const link = screen.getByRole('link', { name: 'Top vaults' });
		expect(link).toHaveAttribute('href', '/vaults');
		expect(link).toHaveAttribute('aria-current', 'page');
	});

	test('opens external links in a new tab without a referrer', () => {
		render(MenuItem, { label: 'Docs', targetUrl: 'https://example.com', external: true });
		const link = screen.getByRole('link', { name: 'Docs' });
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'external noreferrer');
	});
});
