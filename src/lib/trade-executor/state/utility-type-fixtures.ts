import { Fixture, Generator } from 'zod-fixture';
import { decimal, hexEncodedData, hexString, primaryKeyString, unixTimestampToDate } from './utility-types';
import { toHex } from 'viem';

export const decimalGenerator = Generator({
	schema: decimal,
	output: ({ transform }) => transform.utils.random.float().toString()
});

export const hexStringGenerator = Generator({
	schema: hexString,
	output: ({ transform }) => toHex(transform.utils.random.string({}))
});

export const hexEncodedDataGenerator = Generator({
	schema: hexEncodedData,
	output: ({ transform }) => toHex(transform.utils.random.string({})).slice(2)
});

export const primaryKeyStringGenerator = Generator({
	schema: primaryKeyString,
	output: ({ transform }) => transform.utils.random.int({ min: 1, max: 1000 }).toString()
});

export const dateGenerator = Generator({
	schema: unixTimestampToDate,
	output: () => new Date()
});

export const fixture = new Fixture().extend([
	dateGenerator,
	decimalGenerator,
	hexStringGenerator,
	hexEncodedDataGenerator,
	primaryKeyStringGenerator
]);
