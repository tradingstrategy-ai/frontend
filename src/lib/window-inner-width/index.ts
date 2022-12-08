import { writable } from 'svelte/store';

const store = writable(0);

export default {
	...store
};
