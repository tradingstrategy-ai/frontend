import { describe, expect, it } from 'vitest';
import { RELOAD_LOOP_WINDOW_MS, isModuleLoadError, shouldAbortReload } from './hydration-reload-guard';

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem'> & { data: Map<string, string> } {
	const data = new Map<string, string>();
	return {
		data,
		getItem: (key) => data.get(key) ?? null,
		setItem: (key, value) => void data.set(key, value)
	};
}

describe('isModuleLoadError', () => {
	it.each([
		'Failed to fetch dynamically imported module: https://example.com/_app/immutable/nodes/19.js',
		'error loading dynamically imported module: https://example.com/_app/immutable/nodes/19.js',
		'Importing a module script failed.'
	])('matches browser chunk load failures: %s', (message) => {
		expect(isModuleLoadError(new TypeError(message))).toBe(true);
	});

	it('ignores other errors', () => {
		expect(isModuleLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
		expect(isModuleLoadError('Not Found')).toBe(false);
	});
});

describe('shouldAbortReload', () => {
	const href = 'https://tradingstrategy.ai/';

	it('allows the first reload and aborts the second failure of the same URL', () => {
		const storage = memoryStorage();
		expect(shouldAbortReload(href, storage, 1000)).toBe(false);
		expect(shouldAbortReload(href, storage, 1200)).toBe(true);
		expect(shouldAbortReload(href, storage, 1400)).toBe(true);
	});

	it('starts over for a different URL', () => {
		const storage = memoryStorage();
		expect(shouldAbortReload(href, storage, 1000)).toBe(false);
		expect(shouldAbortReload('https://tradingstrategy.ai/strategies', storage, 1200)).toBe(false);
	});

	it('starts over once the window has passed', () => {
		const storage = memoryStorage();
		expect(shouldAbortReload(href, storage, 1000)).toBe(false);
		expect(shouldAbortReload(href, storage, 1000 + RELOAD_LOOP_WINDOW_MS)).toBe(false);
	});

	it('falls back to reloading when storage is unavailable', () => {
		const storage = {
			getItem: () => {
				throw new Error('SecurityError');
			},
			setItem: () => {
				throw new Error('SecurityError');
			}
		};
		expect(shouldAbortReload(href, storage, 1000)).toBe(false);
		expect(shouldAbortReload(href, storage, 1200)).toBe(false);
	});

	it('ignores a corrupt record', () => {
		const storage = memoryStorage();
		storage.setItem('ts:hydration-reload-guard', '{not json');
		expect(shouldAbortReload(href, storage, 1000)).toBe(false);
		expect(shouldAbortReload(href, storage, 1200)).toBe(true);
	});
});
