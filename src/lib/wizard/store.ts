import { writable, type Writable } from 'svelte/store';

export type Wizard = {
	returnTo: string;
	completed: Set<string>;
	data: Record<string, any>;
};

const { set, update, subscribe }: Writable<Wizard | undefined> = writable(undefined);

export default {
	initialize(returnTo: string, data: any = {}) {
		set({
			returnTo,
			completed: new Set(),
			data
		});
	},

	complete(step) {
		update((wizard) => {
			wizard?.completed.add(step);
			return wizard;
		});
	},

	reset: () => set(undefined),

	subscribe
};
