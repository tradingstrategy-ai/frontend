/**
 * Wizard store factory
 *
 * Each wizard uses this to create a custom store that encapsulates the wizard's
 * title, steps, returnTo path and completed state.
 */
import { writable, type Writable } from 'svelte/store';
import { goto } from '$app/navigation';

export type WizardValue = {
	returnTo: string;
	completed: Set<string>;
	data: Record<string, any>;
};

export type Step = {
	slug: string;
	label: string;
};

export default function (slug: string, title: string, steps: Step[]) {
	const { set, update, subscribe }: Writable<WizardValue | undefined> = writable(undefined);

	function init(returnTo: string, data: any = {}) {
		set({
			returnTo,
			completed: new Set(),
			data
		});

		goto(`/wizard/${slug}/${steps[0].slug}`);
	}

	function complete(step: string) {
		update((wizard) => {
			wizard?.completed.add(step);
			return wizard;
		});
	}

	return { init, complete, subscribe, title, steps };
}
