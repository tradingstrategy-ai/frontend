/**
 * Wizard store
 *
 * This is a global/singleton store by design. In a given browser session, only
 * one wizard can be open. Using a global store for wizard state simplifies a
 * lot of code and operatoins – e.g., persiting state to `sessionStorage`.
 *
 * To launch a wizard, import and initialize this store with `wizard.init({…})`,
 * then redirect to the appropriate wizard's first page using `goto`.
 */
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { stringify, parse } from 'devalue';

export type WizardValue = {
	slug: string | undefined;
	returnTo: string | undefined;
	data: Record<string, any>;
	completed: Set<string>;
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
		const data = serialized && parse(serialized);
		return data || {};
	} catch (e) {
		console.error('Error deserializing wizard data from sessionStorage.');
		console.error(e);
	}
}

function setSession(data: WizardValue) {
	storage?.setItem(storageKey, stringify(data));
}

const sessionData = getSession();

const { set, update, subscribe }: Writable<WizardValue> = writable({
	slug: sessionData.slug,
	returnTo: sessionData.returnTo,
	data: sessionData.data ?? {},
	completed: sessionData.completed ?? new Set()
});

function init(slug: string, returnTo: string, data: any = {}) {
	const completed: Set<string> = new Set();
	const wizard = { slug, returnTo, data, completed };
	set(wizard);
	setSession(wizard);
}

function toggleComplete(step: string, completed = true) {
	const action = completed ? 'add' : 'delete';
	update((wizard) => {
		wizard.completed[action](step);
		setSession(wizard);
		return wizard;
	});
}

function updateData(data: any) {
	update((wizard: WizardValue) => {
		wizard.data = { ...wizard.data, ...data };
		setSession(wizard);
		return wizard;
	});
}

export const wizard = { init, toggleComplete, updateData, subscribe };
