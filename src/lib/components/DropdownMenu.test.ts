import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DropdownMenu from './DropdownMenu.svelte';

// zag-js popper uses ResizeObserver via @floating-ui/dom
vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);

const defaultItems = [
	{ href: '/path/one', label: 'Option one' },
	{ href: '/path/two', label: 'Option two' },
	{ href: '/path/three', label: 'Option three' }
];

const defaultProps = {
	label: 'Test menu',
	items: defaultItems
};

describe('DropdownMenu component', () => {
	test('renders trigger button with correct label', () => {
		render(DropdownMenu, defaultProps);
		expect(screen.getByText('Test menu')).toBeInTheDocument();
	});

	test('panel is hidden by default', () => {
		render(DropdownMenu, defaultProps);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	test('clicking trigger opens the panel with menu items', async () => {
		const user = userEvent.setup();
		render(DropdownMenu, defaultProps);

		const trigger = screen.getByText('Test menu').closest('button')!;
		await user.click(trigger);

		expect(screen.getByRole('menu')).toBeInTheDocument();
		expect(screen.getByText('Option one')).toBeVisible();
		expect(screen.getByText('Option two')).toBeVisible();
		expect(screen.getByText('Option three')).toBeVisible();
	});

	test('renders correct number of menu items', async () => {
		const user = userEvent.setup();
		render(DropdownMenu, defaultProps);

		const trigger = screen.getByText('Test menu').closest('button')!;
		await user.click(trigger);

		const menuItems = screen.getAllByRole('menuitem');
		expect(menuItems).toHaveLength(3);
	});

	test('clicking trigger again closes the panel', async () => {
		const user = userEvent.setup();
		render(DropdownMenu, defaultProps);

		const trigger = screen.getByText('Test menu').closest('button')!;
		await user.click(trigger);
		expect(screen.getByRole('menu')).toBeInTheDocument();

		await user.click(trigger);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	test('aria-expanded reflects open state after click', async () => {
		const user = userEvent.setup();
		render(DropdownMenu, defaultProps);

		const trigger = screen.getByText('Test menu').closest('button')!;
		await user.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'true');

		await user.click(trigger);
		// zag-js removes aria-expanded when closed rather than setting to "false"
		expect(trigger.getAttribute('aria-expanded')).not.toBe('true');
	});

	// Note: click-outside dismiss is tested in integration tests (Playwright)
	// because zag-js's @zag-js/interact-outside requires a real browser environment

	test('trigger shows active styling when isActive returns true for any item', () => {
		render(DropdownMenu, {
			...defaultProps,
			isActive: (href: string) => href === '/path/two'
		});

		const trigger = screen.getByText('Test menu').closest('button')!;
		expect(trigger).toHaveClass('active');
	});

	test('trigger does not show active styling when no items are active', () => {
		render(DropdownMenu, {
			...defaultProps,
			isActive: () => false
		});

		const trigger = screen.getByText('Test menu').closest('button')!;
		expect(trigger).not.toHaveClass('active');
	});

	test('individual menu item shows active styling when isActive matches', async () => {
		const user = userEvent.setup();
		render(DropdownMenu, {
			...defaultProps,
			isActive: (href: string) => href === '/path/two'
		});

		const trigger = screen.getByText('Test menu').closest('button')!;
		await user.click(trigger);

		const activeItem = screen.getByText('Option two').closest('a')!;
		expect(activeItem).toHaveClass('active');

		const inactiveItem = screen.getByText('Option one').closest('a')!;
		expect(inactiveItem).not.toHaveClass('active');
	});

	test('resolveHref is applied to item hrefs', async () => {
		const user = userEvent.setup();
		render(DropdownMenu, {
			...defaultProps,
			resolveHref: (href: string) => `/base${href}`
		});

		const trigger = screen.getByText('Test menu').closest('button')!;
		await user.click(trigger);

		const link = screen.getByText('Option one').closest('a')!;
		expect(link).toHaveAttribute('href', '/base/path/one');
	});
});
