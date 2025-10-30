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
