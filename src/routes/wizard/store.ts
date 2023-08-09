/**
 * Wizard store factory
 *
 * Each wizard uses this to create a custom store that encapsulates the wizard's
 * title, steps, returnTo path and completed state.
 */
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { stringify, parse } from 'devalue';
import { goto } from '$app/navigation';

export type WizardValue = {
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

function getSession(slug: string) {
	try {
		const serialized = storage?.getItem(storageKey);
		const data = serialized && parse(serialized)?.[slug];
		return data ?? {};
	} catch (e) {
		console.error('Error deserializing wizard data from sessionStorage.');
		console.error(e);
	}
}

function setSession(slug: string, data: WizardValue) {
	storage?.setItem(storageKey, stringify({ [slug]: data }));
}

export function createWizardStore(slug: string, title: string, steps: Step[]) {
	const sessionData = getSession(slug);

	const { set, update, subscribe }: Writable<WizardValue> = writable({
		returnTo: sessionData.returnTo,
		data: sessionData.data ?? {},
		completed: sessionData.completed ?? new Set()
	});

	function init(returnTo: string, data: any = {}) {
		const completed: Set<string> = new Set();
		const wizard = { returnTo, data, completed };
		set(wizard);
		setSession(slug, wizard);
		goto(`/wizard/${slug}/${steps[0].slug}`);
	}

	function toggleComplete(step: string, completed = true) {
		const action = completed ? 'add' : 'delete';
		update((wizard) => {
			wizard.completed[action](step);
			setSession(slug, wizard);
			return wizard;
		});
	}

	function updateData(data: any) {
		update((wizard: WizardValue) => {
			wizard.data = { ...wizard.data, ...data };
			setSession(slug, wizard);
			return wizard;
		});
	}

	return { init, toggleComplete, updateData, subscribe, title, steps };
}

export type Wizard = ReturnType<typeof createWizardStore>;
