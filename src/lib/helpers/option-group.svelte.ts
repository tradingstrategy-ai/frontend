export class OptionGroup<T extends string = string> {
	#selected = $state() as T;

	constructor(
		public options: readonly T[],
		public defaultValue: T,
		selected?: MaybeString
	) {
		this.selected = selected;
	}

	// validate if option is valid (and narrow type)
	isValidOption(value: MaybeString): value is T {
		return value != null && this.options.includes(value as T);
	}

	// set #selected to supplied value if valid, defaultValue otherwise
	set selected(value: MaybeString) {
		this.#selected = this.isValidOption(value) ? value : this.defaultValue;
	}

	get selected(): T {
		return this.#selected;
	}
}
