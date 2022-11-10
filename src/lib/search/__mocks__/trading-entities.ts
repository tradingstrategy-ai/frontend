import { writable } from 'svelte/store';

const { subscribe } = writable({
	hits: [],
	facets: [],
	count: null,
	total: null
});

const search = () => {};

export default { subscribe, search };
