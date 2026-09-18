import { expect, type Page } from '@playwright/test';

/**
 * Wait until the page has hydrated.
 *
 * Values typed into a form and menus clicked before hydration are lost when the Svelte components
 * mount and re-render. `Header` sets `data-navigation-hydrated` from `onMount`, which Svelte 5 runs
 * after the whole tree — layout and page — has been hydrated in one pass, so the marker doubles as
 * a page-wide hydration barrier.
 *
 * @param page - the page under test; the header is rendered by the root layout on every page
 */
export async function waitForHydration(page: Page) {
	await expect(page.locator('#navigation-panel-toggle')).toHaveAttribute('data-navigation-hydrated', 'true');
}
