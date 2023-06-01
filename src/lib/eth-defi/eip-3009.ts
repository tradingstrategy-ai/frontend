// NOTE: wagmi functions below depend on '$lib/wallet/client' initialization
import { multicall, signTypedData } from '@wagmi/core';
import { bytesToHex, hexToNumber, numberToHex, slice } from 'viem';
import { parseAbi } from 'viem';

type TokenInfo = {
	address: Address;
	name: string;
	decimals: number;
	version: string;
};

export async function fetchTokenInfo(address: Address) {
	const abi = parseAbi([
		'function name() view returns (string)',
		'function decimals() view returns (uint8)',
		'function version() view returns (string)',
		'function EIP712_VERSION() view returns (string)',
		'function DOMAIN_SEPARATOR() view returns (bytes32)'
	]);

	const functionNames = ['name', 'decimals', 'version', 'EIP712_VERSION'];

	const response = await multicall({
		contracts: functionNames.map((functionName) => ({ address, abi, functionName }))
	});

	const [name, decimals, version, eip712Version] = response.map((item) => item.result);

	return {
		address,
		name,
		decimals,
		version: version ?? eip712Version ?? '1'
	} as TokenInfo;
}

// return custom EIP712Domain for Polygon PoS v1 token
function getEIP712Domain(chainId: number, token: TokenInfo) {
	if (chainId === 137 && token.version === '1') {
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

function getTypes(chainId: number, token: TokenInfo, transferMethod: TransferMethod) {
	return {
		EIP712Domain: getEIP712Domain(chainId, token),

		[transferMethod]: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'validAfter', type: 'uint256' },
			{ name: 'validBefore', type: 'uint256' },
			{ name: 'nonce', type: 'bytes32' }
		]
	};
}

function getDomain(chainId: number, token: TokenInfo) {
	return {
		name: token.name,
		version: token.version,
		chainId,
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

type EIP3009Types = ReturnType<typeof getTypes>;
type Domain = ReturnType<typeof getDomain>;
type Message = ReturnType<typeof getMessage>;

async function getSignature(types: EIP3009Types, domain: Domain, message: Message, primaryType: TransferMethod) {
	const raw = await signTypedData({
		domain,
		types,
		message,
		primaryType
	});

	return {
		raw,
		v: hexToNumber(slice(raw, 64)),
		r: slice(raw, 0, 32),
		s: slice(raw, 32, 64)
	};
}

export async function getSignedArguments(
	transferMethod: TransferMethod,
	chainId: number,
	token: TokenInfo,
	from: Address,
	to: Address,
	value: bigint | number,
	validAfter: number = 0,
	validBefore: MaybeNumber = undefined
) {
	const types = getTypes(chainId, token, transferMethod);
	const domain = getDomain(chainId, token);
	const message = getMessage(from, to, value, validAfter, validBefore);
	const { v, r, s } = await getSignature(types, domain, message, transferMethod);
	return [...Object.values(message), v, r, s];
}
