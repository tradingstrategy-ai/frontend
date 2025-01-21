import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { browser } from '$app/environment';
import { stringify, parse } from 'devalue';
import { z } from 'zod';

const wizardContextKey = Symbol('wizard');

export function setWizardContext<T extends BaseWizardData>(wizard: WizardState<T>) {
	setContext(wizardContextKey, wizard);
}

export function getWizardContext<T extends BaseWizardData>(): WizardState<T> {
	return getContext(wizardContextKey) as WizardState<T>;
}

const wizardDataSchema = z.object({
	returnTo: z.string(),
	data: z.record(z.any()),
	completed: z.set(z.string())
});

type WizardData<T> = z.infer<typeof wizardDataSchema> & {
	data: T;
};

const storage = browser ? window.sessionStorage : undefined;
const storageKeyBase = 'ts:wizard';

type BaseWizardData = Record<string, any>;

export class WizardState<T extends BaseWizardData> {
	slug: string;
	returnTo: string;
	data = $state() as T;
	#completed: SvelteSet<string>;

	constructor(slug: string, returnTo: string | undefined, data: T = {} as T, completed?: Iterable<string>) {
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
		return `${storageKeyBase}:${this.slug}`;
	}

	updateData(data: T) {
		Object.assign(this.data, data);
	}

	hasCompleted(stepSlug: string) {
		return this.#completed.has(stepSlug);
	}

	toggleComplete(stepSlug: string, completed = true) {
		if (completed) {
			this.#completed.add(stepSlug);
		} else {
			this.#completed.delete(stepSlug);
		}
	}

	serialize() {
		const data = {
			returnTo: this.returnTo,
			data: this.data,
			completed: this.#completed
		};
		storage?.setItem(this.storageKey, stringify(data));
	}

	deserialize() {
		try {
			const raw = storage?.getItem(this.storageKey);
			if (!raw) {
				throw new Error(`sessionStorage['${this.storageKey}'] not found`);
			}
			return wizardDataSchema.parse(parse(raw)) as WizardData<T>;
		} catch (cause) {
			throw new Error('Error deserializing wizard data from sessionStorage.', { cause });
		}
	}
}
