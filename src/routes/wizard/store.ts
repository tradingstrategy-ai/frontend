/**
 * Wizard store
 *
 * This is a global/singleton store by design. In a given browser session, only
 * one wizard can be open. Using a global store for wizard state simplifies a
 * lot of code and operations – e.g., persiting state to `sessionStorage`.
 *
 * Data from this store is serialized to `sessionStorage`. This data is restored
 * when the module is loaded. This allows for persistance across page reloads,
 * isolated to the specific browser tab.
 *
 * To launch a wizard, import and initialize this store with `wizard.init({…})`,
 * then redirect to the appropriate wizard's first page using `goto`.
 */
import { browser } from '$app/environment';
import { derived, writable, type Writable } from 'svelte/store';
import { stringify, parse } from 'devalue';

export type WizardValue = {
	slug?: string;
	returnTo?: string;
	data?: Record<string, any>;
	completed?: Set<string>;
};

export type Step = {
	slug: string;
	label: string;
};

const storage = browser ? window.sessionStorage : undefined;
const storageKey = 'ts:wizard';

function getSession() {
	try {
		const serialized = storage?.getItem(storageKey);
		return serialized ? parse(serialized) : {};
	} catch (e) {
		console.error('Error deserializing wizard data from sessionStorage.');
		console.error(e);
	}
}

function setSession(data: WizardValue) {
	storage?.setItem(storageKey, stringify(data));
}

const { set, update, ...baseStore }: Writable<WizardValue> = writable(getSession());

function init(slug: string, returnTo: string, data: any = {}) {
	const completed: Set<string> = new Set();
	set({ slug, returnTo, data, completed });
}

function toggleComplete(step: string, completed = true) {
	const action = completed ? 'add' : 'delete';
	update(($wizard) => {
		if (!$wizard.completed) throw Error('wizard not initialized');
		$wizard.completed[action](step);
		return $wizard;
	});
}

function updateData(data: any) {
	update(($wizard) => {
		if (!$wizard.data) throw Error('wizard not initialized');
		$wizard.data = { ...$wizard.data, ...data };
		return $wizard;
	});
}

// Clear the store and sessionStorage data
function reset() {
	set({});
	storage?.removeItem(storageKey);
}

// use derived store to update sessionStorage whenever baseStore changes
const { subscribe } = derived(baseStore, ($wizard) => {
	setSession($wizard);
	return $wizard;
});

export const wizard = { init, toggleComplete, updateData, reset, subscribe };
