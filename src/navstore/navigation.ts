/**
 * Based on the implementation by Shajid Hasan
 *
 * https://github.com/shajidhasan/sveltekit-page-progress-demo/blob/main/src/routes/__layout.svelte
 */

import { writable } from 'svelte/store';

type NavigationState = "loading" | "loaded" | null;

export default writable<NavigationState>(null);