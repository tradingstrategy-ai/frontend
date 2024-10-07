/**
 * This module is used to map Terms of Service contracts and versions for each blockchain
 * to corresponding ToS file versions and acceptance messages.
 *
 * The acceptance message is needed to generate a hash and signature; we currently don't
 * have a way to retrieve this directly from the blockchain, so it is made available via
 * this local mapping.
 */
export type TosVersionParams = {
	chainId: number;
	address: Address;
	version: number;
};

export type TosVersion = TosVersionParams & {
	fileName?: string;
	acceptanceMessage?: string;
};

const tosVersions: TosVersion[] = [
	// Etherium versions
	{
		chainId: 1,
		address: '0xd63c1bE9D8B56CCcD6fd2Dd9F9c030c6a9916f5F',
		version: 1,
		fileName: '2024-03-20.txt',
		acceptanceMessage:
			'I agree on Terms of Service. I understand smart contract trading is risky and I may lose all of my deposits. \n\nThis Terms of Service version 1, dated 2024-03-20, was published at https://tradingstrategy.ai/tos/2024-03-20.txt'
	},

	// Polygon versions
	{
		chainId: 137,
		address: '0xbe1418df0bAd87577de1A41385F19c6e77312780',
		version: 1,
		fileName: '155d6737cb.txt',
		acceptanceMessage:
			'I read and agree on terms of service (version 1) to use\nsmart contract software deployed on a blockchain.   \n\nThe terms of service text was published 10.1.2024 at https://example.com.\nThe unique identifier hash for this terms of service text was 0x0000000000000000000000000000000000000000.'
	},
	{
		chainId: 137,
		address: '0xbe1418df0bAd87577de1A41385F19c6e77312780',
		version: 2,
		fileName: '2024-03-20.txt',
		acceptanceMessage:
			'I read and agree on Terms of Service to access the\\nsmart contract software deployed on a blockchain.\\n\\nThe Terms of Service version 2, dated 2024-03-20, was published at \\nhttps://tradingstrategy.ai/tos/2024-03-20.txt'
	},
	{
		chainId: 137,
		address: '0xbe1418df0bAd87577de1A41385F19c6e77312780',
		version: 3,
		fileName: '2024-03-20.txt',
		acceptanceMessage:
			'I read and agree on Terms of Service to access the\nsmart contract software deployed on a blockchain.\n\nThe Terms of Service version 3, dated 2024-03-20, was published at \nhttps://tradingstrategy.ai/tos/2024-03-20.txt'
	},
	{
		chainId: 137,
		address: '0xbe1418df0bAd87577de1A41385F19c6e77312780',
		version: 4,
		fileName: '2024-03-30.txt',
		acceptanceMessage: '<failed>'
	},
	{
		chainId: 137,
		address: '0xbe1418df0bAd87577de1A41385F19c6e77312780',
		version: 5,
		fileName: '2024-03-30.txt',
		acceptanceMessage:
			'I agree on Terms of Service. I understand smart contract trading is risky and I may lose all of my deposits. \n\nThis Terms of Service version 5, dated 2024-03-30, was published at https://tradingstrategy.ai/tos/2024-03-30.txt'
	},

	// Arbitrum versions
	{
		chainId: 42161,
		address: '0xDCD7C644a6AA72eb2f86781175b18ADc30Aa4f4d',
		version: 1,
		fileName: '2024-03-20.txt',
		acceptanceMessage:
			'I agree on Terms of Service. I understand smart contract trading is risky and I may lose all of my deposits. \n\nThis Terms of Service version 1, dated 2024-03-20, was published at https://tradingstrategy.ai/tos/2024-03-20.txt'
	}
];

/**
 * Get Terms of Service version info for a given chain, address and version
 *
 * @param chainId - chainId of the strategy
 * @param address - Terms of Service contract address of the strategy
 * @param version - Terms of Service version
 *
 */
export function getTosVersion(params: TosVersionParams): TosVersion {
	const tosVersion = tosVersions.find((tos) => {
		return (['chainId', 'address', 'version'] as const).every((key) => tos[key] === params[key]);
	});
	return { ...params, ...tosVersion };
}
