import { type FetchTokenResult, signTypedData } from '@wagmi/core';
import { bytesToHex, hexToNumber, numberToHex, slice } from 'viem';

// TODO:
// - function to return `EIP712Domain` or `types`
// - add `chainId` or `salt` depending on `DOMAIN_SEPARATOR`
const types = {
	EIP712Domain: [
		{ name: 'name', type: 'string' },
		{ name: 'version', type: 'string' },
		// { name: 'chainId', type: 'uint256' },
		{ name: 'verifyingContract', type: 'address' },
		{ name: 'salt', type: 'bytes32' }
	],

	TransferWithAuthorization: [
		{ name: 'from', type: 'address' },
		{ name: 'to', type: 'address' },
		{ name: 'value', type: 'uint256' },
		{ name: 'validAfter', type: 'uint256' },
		{ name: 'validBefore', type: 'uint256' },
		{ name: 'nonce', type: 'bytes32' }
	]
} as const;

// TODO:
// - get `version` from contract (fall back to 1)
// - add `chainId` or `salt` depending on `DOMAIN_SEPARATOR`
//   (or perhaps depending on `types.EIP712Domain`)
function getDomain(chainId: number, token: FetchTokenResult) {
	return {
		name: token.name,
		version: '1',
		// chainId,
		verifyingContract: token.address,
		salt: numberToHex(chainId, { size: 32 })
	};
}

function getMessage(
	from: Address,
	to: Address,
	value: number | bigint,
	validAfter: number = 0,
	validBefore: MaybeNumber
) {
	if (!Number.isFinite(validBefore)) {
		validBefore = Math.floor(Date.now() / 1000) + 3600;
	}
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	const nonce = bytesToHex(bytes, { size: 32 });
	return {
		from,
		to,
		value: BigInt(value),
		validAfter: BigInt(validAfter),
		validBefore: BigInt(validBefore),
		nonce
	};
}

export async function getSignature(
	chainId: number,
	token: FetchTokenResult,
	from: Address,
	to: Address,
	value: bigint | number,
	validAfter: number = 0,
	validBefore: MaybeNumber = undefined
) {
	const domain = getDomain(chainId, token);
	const message = getMessage(from, to, value, validAfter, validBefore);

	return signTypedData({
		domain,
		types,
		message,
		primaryType: 'TransferWithAuthorization'
	});
}

export async function getSignedArguments(
	chainId: number,
	token: FetchTokenResult,
	from: Address,
	to: Address,
	value: bigint | number,
	validAfter: number = 0,
	validBefore: MaybeNumber = undefined
) {
	const domain = getDomain(chainId, token);
	const message = getMessage(from, to, value, validAfter, validBefore);

	const signature = await signTypedData({
		domain,
		types,
		message,
		primaryType: 'TransferWithAuthorization'
	});

	// TODO: move extraction of v r s to a function (maybe grouped with signTypedData)
	const v = hexToNumber(slice(signature, 64));
	const r = slice(signature, 0, 32);
	const s = slice(signature, 32, 64);

	return Object.values(message).concat(v, r, s);
}
