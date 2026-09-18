import { expect, type Page } from '@playwright/test';

/**
 * Wait until the page has hydrated.
 *
 * Values typed into a form and menus clicked before hydration are lost when the Svelte components
 * mount and re-render, so interactive tests wait for the marker `Header` sets once it has hydrated.
 */
export async function waitForHydration(page: Page) {
	await expect(page.locator('#navigation-panel-toggle')).toHaveAttribute('data-navigation-hydrated', 'true');
}
