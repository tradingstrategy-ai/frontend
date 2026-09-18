import { describe, expect, test } from 'vitest';
import {
	type Abi,
	BaseError,
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	encodeErrorResult,
	parseAbi
} from 'viem';
import { describeError, extractErrorInfo, getRevertReason } from './helpers';

// the Lagoon vault error behind a failed "Cancel deposit" once the request is locked for settlement
const abi = parseAbi(['error RequestNotCancelable(uint256 requestId)', 'function cancelRequestDeposit()']);

/** Build the error viem throws from `simulateContract` for a revert with the given raw data */
function revert(data: `0x${string}`, revertAbi: Abi = abi) {
	const reverted = new ContractFunctionRevertedError({ abi: revertAbi, data, functionName: 'cancelRequestDeposit' });
	return new ContractFunctionExecutionError(reverted, { abi: revertAbi, functionName: 'cancelRequestDeposit' });
}

describe('getRevertReason', () => {
	test('decodes a custom error with its arguments', () => {
		const data = encodeErrorResult({ abi, errorName: 'RequestNotCancelable', args: [3n] });
		expect(getRevertReason(revert(data))).toBe('RequestNotCancelable(3)');
	});

	test('returns the require reason of an Error(string) revert', () => {
		const data = encodeErrorResult({
			abi: parseAbi(['error Error(string)']),
			errorName: 'Error',
			args: ['insufficient balance']
		});
		expect(getRevertReason(revert(data))).toBe('insufficient balance');
	});

	test('falls back to the selector when the ABI does not know the error', () => {
		const data = encodeErrorResult({ abi, errorName: 'RequestNotCancelable', args: [3n] });
		const reason = getRevertReason(revert(data, parseAbi(['function cancelRequestDeposit()'])));
		expect(reason).toMatch(/^unknown error 0x[0-9a-f]{8}$/);
	});

	test('is undefined for errors that are not reverts', () => {
		expect(getRevertReason(new BaseError('Wallet is not connected.'))).toBeUndefined();
		expect(getRevertReason(new Error('boom'))).toBeUndefined();
		expect(getRevertReason('not an error')).toBeUndefined();
	});

	test('works on the serialisable ErrorInfo extracted from the error', () => {
		const data = encodeErrorResult({ abi, errorName: 'RequestNotCancelable', args: [3n] });
		const info = extractErrorInfo(revert(data));
		expect(info.revertReason).toBe('RequestNotCancelable(3)');
		expect(getRevertReason(info)).toBe('RequestNotCancelable(3)');
	});
});

describe('describeError', () => {
	test('appends the revert reason to the short message', () => {
		const data = encodeErrorResult({ abi, errorName: 'RequestNotCancelable', args: [3n] });
		expect(describeError(revert(data))).toBe(
			'The contract function "cancelRequestDeposit" reverted: RequestNotCancelable(3)'
		);
	});

	test('uses the short message alone when there is no revert', () => {
		expect(describeError(new BaseError('User rejected the request.'))).toBe('User rejected the request.');
	});

	test('accepts extracted ErrorInfo and falls back when empty', () => {
		expect(describeError({ shortMessage: 'Timed out.' })).toBe('Timed out.');
		expect(describeError({}, 'Unable to verify transaction status.')).toBe('Unable to verify transaction status.');
		expect(describeError(undefined)).toBe('Failure reason unknown.');
	});
});
