import { describe, expect, test } from 'vitest';
import { deserialiseSearchParams, serialiseSearchParams, type ParamSchema } from './url-search-state';

const schema = {
	view: { type: 'string', defaultValue: 'all' },
	selected: { type: 'string[]', defaultValue: [], options: ['a', 'b', 'c'] }
} as const satisfies ParamSchema;

describe('URL search state', () => {
	test('reads repeated string values and excludes unsupported options', () => {
		expect(deserialiseSearchParams(new URLSearchParams('selected=b&selected=unknown&selected=a'), schema)).toEqual({
			view: 'all',
			selected: ['b', 'a']
		});
	});

	test('writes arrays as repeated parameters and omits array defaults', () => {
		expect(serialiseSearchParams({ view: 'all', selected: ['a', 'c'] }, schema)).toBe('selected=a&selected=c');
		expect(serialiseSearchParams({ view: 'all', selected: [] }, schema)).toBe('');
	});
});
