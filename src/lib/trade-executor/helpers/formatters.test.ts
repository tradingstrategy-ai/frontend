import { describe, test, expect } from 'vitest';
import { formatTokenAmount } from './formatters';

describe('formatTokenAmount', () => {
	test('should return `---` for null or undefined', () => {
		expect(formatTokenAmount(null)).toBe('---');
	});

	// TODO: additional test coverage needed!
});
