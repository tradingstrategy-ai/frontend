import type { TypedData, TypedDataDomain } from 'viem';
import { bytesToHex, getTypesForEIP712Domain, hexToNumber, numberToHex, slice } from 'viem';
import { type Config, type SignTypedDataParameters, signTypedData } from '@wagmi/core';
import type { TokenInfo } from './helpers';

function getDomain(chainId: number, { name, version, address }: TokenInfo): TypedDataDomain {
	const commonFields = { name, version, verifyingContract: address };

	// special case for Polygon PoS v1 USDC (bridged) token
	if (chainId === 137 && version === '1') {
		const salt = numberToHex(chainId, { size: 32 });
		return { ...commonFields, salt };
	}

	// all other cases
	return { ...commonFields, chainId };
}

type TransferMethod = 'TransferWithAuthorization' | 'ReceiveWithAuthorization';

function getTypes(domain: TypedDataDomain, transferMethod: TransferMethod) {
	const types: TypedData = {
		EIP712Domain: getTypesForEIP712Domain({ domain })
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
	const domain = getDomain(chainId, token);
	const types = getTypes(domain, transferMethod);
	const message = prepareMessage(messageParams);
	const { v, r, s } = await getSignature(config, { types, domain, message, primaryType: transferMethod });
	return [...Object.values(message), v, r, s];
}

export type SignedArguments = Awaited<ReturnType<typeof getSignedArguments>>;
