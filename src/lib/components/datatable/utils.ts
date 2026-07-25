import type { Component } from 'svelte';
import { createRender as originalCreateRender } from 'svelte-headless-table';

type CreateRenderParams = Parameters<typeof originalCreateRender>;

// Wrapper that bridges Svelte 5 Component to Svelte 4 SvelteComponent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createRender<TProps extends Record<string, any> = Record<string, any>>(
	component: Component<TProps>,
	props: CreateRenderParams[1]
) {
	return originalCreateRender(component as unknown as CreateRenderParams[0], props);
}

/**
 * Resolve a plain-text label for a table column header.
 *
 * Column headers may be plain strings or `ComponentRenderConfig` objects (e.g. a
 * header rendered through a Svelte component to add a tooltip). Contexts that can
 * only display text — the mobile card `data-label` and the mobile sort `<select>`
 * — cannot render a component and would otherwise stringify the config to
 * "[object Object]". Component-based headers should carry a `label` prop holding
 * their plain-text equivalent so those contexts can fall back to it.
 *
 * @param header - The column `header` (or header cell `label`) value.
 * @returns Plain-text label, or an empty string when none can be resolved.
 */
export function getColumnLabel(header: unknown): string {
	if (typeof header === 'string' || typeof header === 'number') {
		return String(header);
	}
	if (header && typeof header === 'object' && 'props' in header) {
		const props = (header as { props?: unknown }).props;
		if (props && typeof props === 'object' && 'label' in props) {
			const label = (props as { label?: unknown }).label;
			if (typeof label === 'string' || typeof label === 'number') {
				return String(label);
			}
		}
	}
	return '';
}
