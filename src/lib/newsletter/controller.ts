import { writable } from 'svelte/store';

export const subscribeDialogOpen = writable(false);

// export function for toggling open state of global (layout) dialog
export function toggleSubscribeDialog() {
	subscribeDialogOpen.update((open) => !open);
}
