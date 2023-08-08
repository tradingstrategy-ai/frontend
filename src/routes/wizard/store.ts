/**
 * Wizard store factory
 *
 * Each wizard uses this to create a custom store that encapsulates the wizard's
 * title, steps, returnTo path and completed state.
 */
import { writable, type Writable } from 'svelte/store';
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

function wizardFactory(slug: string, title: string, steps: Step[]) {
	const { set, update, subscribe }: Writable<WizardValue> = writable({
		returnTo: undefined,
		data: {},
		completed: new Set()
	});

	function init(returnTo: string, data: any = {}) {
		set({ returnTo, data, completed: new Set() });

		goto(`/wizard/${slug}/${steps[0].slug}`);
	}

	function toggleComplete(step: string, completed = true) {
		const action = completed ? 'add' : 'delete';
		update((wizard) => {
			wizard.completed[action](step);
			return wizard;
		});
	}

	function updateData(data: any) {
		update((wizard: WizardValue) => {
			wizard.data = { ...wizard.data, ...data };
			return wizard;
		});
	}

	return { init, toggleComplete: toggleComplete, updateData, subscribe, title, steps };
}

export default wizardFactory;
export type Wizard = ReturnType<typeof wizardFactory>;
