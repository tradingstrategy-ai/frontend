import { type Config, type SignTypedDataParameters, signTypedData } from '@wagmi/core';
import { type TypedData, bytesToHex, hexToNumber, numberToHex, slice } from 'viem';
import type { TokenInfo } from './helpers';

// return custom EIP712Domain for Polygon PoS v1 token
function getEIP712Domain(chainId: number, tokenVersion: string) {
	if (chainId === 137 && tokenVersion === '1') {
		return [
			{ name: 'name', type: 'string' },
			{ name: 'version', type: 'string' },
			{ name: 'verifyingContract', type: 'address' },
			{ name: 'salt', type: 'bytes32' }
		];
	} else {
		return [
			{ name: 'name', type: 'string' },
			{ name: 'version', type: 'string' },
			{ name: 'chainId', type: 'uint256' },
			{ name: 'verifyingContract', type: 'address' }
		];
	}
}

type TransferMethod = 'TransferWithAuthorization' | 'ReceiveWithAuthorization';

function getTypes(chainId: number, tokenVersion: string, transferMethod: TransferMethod) {
	const types: TypedData = {
		EIP712Domain: getEIP712Domain(chainId, tokenVersion)
	};

	types[transferMethod] = [
		{ name: 'from', type: 'address' },
		{ name: 'to', type: 'address' },
		{ name: 'value', type: 'uint256' },
		{ name: 'validAfter', type: 'uint256' },
		{ name: 'validBefore', type: 'uint256' },
		{ name: 'nonce', type: 'bytes32' }
	];

	return types;
}

function getDomain(chainId: number, { name, version, address }: TokenInfo) {
	return {
		name,
		version,
		chainId,
		verifyingContract: address,
		salt: numberToHex(chainId, { size: 32 })
	};
}

type RawMessageParams = {
	from: Address;
	to: Address;
	value: number | bigint;
	validAfter?: number;
	validBefore?: number;
};

function prepareMessage(params: RawMessageParams) {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return {
		...params,
		value: BigInt(params.value),
		validAfter: BigInt(params.validAfter ?? 0),
		validBefore: BigInt(params.validBefore ?? Math.floor(Date.now() / 1000) + 3600),
		nonce: bytesToHex(bytes, { size: 32 })
	};
}

async function getSignature(config: Config, parameters: SignTypedDataParameters) {
	const raw = await signTypedData(config, parameters);
	return {
		raw,
		v: hexToNumber(slice(raw, 64)),
		r: slice(raw, 0, 32),
		s: slice(raw, 32, 64)
	};
}

export type GetSignedArgumentsParams = RawMessageParams & {
	transferMethod: TransferMethod;
	chainId: number;
	token: TokenInfo;
};

export async function getSignedArguments(config: Config, params: GetSignedArgumentsParams) {
	const { chainId, token, transferMethod, ...messageParams } = params;
	const types = getTypes(chainId, token.version, transferMethod);
	const domain = getDomain(chainId, token);
	const message = prepareMessage(messageParams);
	const { v, r, s } = await getSignature(config, { types, domain, message, primaryType: transferMethod });
	return [...Object.values(message), v, r, s];
}

export type SignedArguments = Awaited<ReturnType<typeof getSignedArguments>>;
