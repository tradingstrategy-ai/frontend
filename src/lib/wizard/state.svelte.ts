import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { browser } from '$app/environment';
import { stringify, parse } from 'devalue';
import { z } from 'zod';

const wizardContextKey = Symbol('wizard');

export function setWizardContext(wizard: WizardState) {
	setContext(wizardContextKey, wizard);
}

export function getWizardContext(): WizardState {
	return getContext(wizardContextKey) as WizardState;
}

const wizardDataSchema = z.object({
	returnTo: z.string(),
	data: z.record(z.any()),
	completed: z.set(z.string())
});

// TODO: move this somewhere better!
export type Step = {
	slug: string;
	label: string;
};

// TODO: make (static) properties?
const storage = browser ? window.sessionStorage : undefined;
const storageKey = 'ts:wizard';

export class WizardState {
	slug: string;
	returnTo: string;
	data = $state() as Record<string, any>;
	#completed: SvelteSet<string>;

	constructor(
		slug: string,
		returnTo: string | undefined,
		data: Record<string, any> = {},
		completed?: Iterable<string>
	) {
		// assign slug right away (required by deserialize)
		this.slug = slug;

		// if returnTo is not defined, deserialize data from session storage
		if (!returnTo) {
			({ returnTo, data, completed } = this.deserialize());
		}

		// assign instance variables
		this.returnTo = returnTo;
		this.data = data;
		this.#completed = new SvelteSet(completed);

		// serialize to session storage whenever reactive data is mutated
		$effect(() => {
			this.serialize();
			return () => {
				storage?.removeItem(this.storageKey);
			};
		});
	}

	get storageKey() {
		return `${storageKey}:${this.slug}`;
	}

	// TODO: replace with hasCompleted(step)
	get completed() {
		return this.#completed;
	}

	toggleComplete(step: string, completed = true) {
		if (completed) {
			this.completed.add(step);
		} else {
			this.completed.delete(step);
		}
	}

	serialize() {
		const data = {
			returnTo: this.returnTo,
			data: this.data,
			completed: this.completed
		};
		storage?.setItem(this.storageKey, stringify(data));
	}

	deserialize() {
		try {
			const raw = storage?.getItem(this.storageKey);
			if (!raw) {
				throw new Error(`sessionStorage['${this.storageKey}'] not found`);
			}
			return wizardDataSchema.parse(parse(raw));
		} catch (cause) {
			throw new Error('Error deserializing wizard data from sessionStorage.', { cause });
		}
	}
}
