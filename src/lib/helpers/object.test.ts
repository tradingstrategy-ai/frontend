import { merge } from './object';

describe('merge helper', () => {
	const target = {
		bar: 'target bar',
		baz: 'baz',
		arr: [1, 2, 3],
		fn: () => 'target fn',
		obj: {
			a: 'target a',
			b: 'target b'
		}
	};

	const source = {
		foo: 'foo',
		bar: 'source bar',
		arr: [2, 3, 4, 5],
		fn: () => 'source fn',
		obj: {
			a: 'sourca a',
			c: 'source c'
		}
	};

	const merged = merge(target, source);

	test('should mutate and return target object', () => {
		expect(merged).toBe(target);
	});

	test('should append property from source onto target', () => {
		expect(target).toHaveProperty('foo', 'foo');
	});

	test('should replace target value with source value', () => {
		expect(target).toHaveProperty('bar', 'source bar');
	});

	test('should retain target properties when no matching source', () => {
		expect(target).toHaveProperty('baz', 'baz');
	});

	test('should replace target array with source array', () => {
		expect(target).toHaveProperty('arr', source.arr);
		expect(target.arr).toHaveLength(4);
	});

	test('should replace target function with source function', () => {
		expect(target).toHaveProperty('fn', source.fn);
		expect(target.fn()).toEqual('source fn');
	});

	test('should recursively merge source object onto target object', () => {
		expect(target.obj).toHaveProperty('a', 'sourca a');
		expect(target.obj).toHaveProperty('b', 'target b');
		expect(target.obj).toHaveProperty('c', 'source c');
	});
});
