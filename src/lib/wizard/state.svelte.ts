import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { browser } from '$app/environment';
import { stringify, parse } from 'devalue';
import { z } from 'zod';

const storage = browser ? window.sessionStorage : undefined;
const storageKeyBase = 'ts:wizard';
const wizardContextKey = Symbol(storageKeyBase);

const baseDataSchema = z.object({});
type BaseDataSchema = typeof baseDataSchema;

const wizardSerializationSchema = z.object({
	returnTo: z.string(),
	data: baseDataSchema,
	completed: z.set(z.string())
});
type WizardSerialization = z.infer<typeof wizardSerializationSchema>;

export function setWizardContext<T extends BaseDataSchema>(wizard: WizardState<T>) {
	setContext(wizardContextKey, wizard);
}

export function getWizardContext<T extends BaseDataSchema>(): WizardState<T> {
	return getContext(wizardContextKey) as WizardState<T>;
}

export class WizardState<T extends BaseDataSchema> {
	slug: string;
	returnTo: string;
	data = $state() as z.infer<T>;
	#completed: SvelteSet<string>;

	constructor(
		slug: string,
		returnTo: string | undefined,
		dataSchema: T = baseDataSchema as T,
		data: z.infer<T> = dataSchema.parse({}),
		completed?: Iterable<string>
	) {
		// assign slug right away (required by deserialize)
		this.slug = slug;

		// if returnTo is not defined, deserialize data from session storage
		if (returnTo) {
			data = dataSchema.parse(data);
		} else {
			({ returnTo, data, completed } = this.deserialize(dataSchema));
		}

		// assign remaining instance variables
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

	updateData(data: z.infer<T>) {
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
		const data: WizardSerialization = {
			returnTo: this.returnTo,
			data: this.data,
			completed: this.#completed
		};
		storage?.setItem(this.storageKey, stringify(data));
	}

	deserialize(dataSchema: T) {
		try {
			const raw = storage?.getItem(this.storageKey);
			if (!raw) {
				throw new Error(`sessionStorage['${this.storageKey}'] not found`);
			}
			const parsed = wizardSerializationSchema.parse(parse(raw));
			return {
				...parsed,
				data: dataSchema.parse(parsed.data)
			};
		} catch (cause) {
			throw new Error('Error deserializing wizard data from sessionStorage.', { cause });
		}
	}
}
