import { writable, type Writable } from 'svelte/store';

export type Wizard = {
	returnTo: string;
	completed: Set<string>;
	data: Record<string, any>;
};

const { set, subscribe }: Writable<Wizard | undefined> = writable(undefined);

export default {
	initializing: false,

	initialize(returnTo: string, data: any = {}) {
		this.initializing = true;

		set({
			returnTo,
			completed: new Set(),
			data
		});
	},

	reset: () => set(undefined),

	subscribe
};
