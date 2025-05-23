// TermedVaultUSDCPaymentForwarder.json exported `as const` for proper typing with viem/@wagmi
export default [
	{
		"type": "constructor",
		"inputs": [
			{
				"name": "_token",
				"type": "address",
				"internalType": "contract IEIP3009"
			},
			{
				"name": "_comptroller",
				"type": "address",
				"internalType": "contract IEnzymeComptroller"
			},
			{
				"name": "_termsOfService",
				"type": "address",
				"internalType": "contract ITermsOfService"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "amountProxied",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "buySharesOnBehalfUsingTransferWithAuthorizationAndTermsOfService",
		"inputs": [
			{
				"name": "from",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "to",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "value",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "validAfter",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "validBefore",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "nonce",
				"type": "bytes32",
				"internalType": "bytes32"
			},
			{
				"name": "v",
				"type": "uint8",
				"internalType": "uint8"
			},
			{
				"name": "r",
				"type": "bytes32",
				"internalType": "bytes32"
			},
			{
				"name": "s",
				"type": "bytes32",
				"internalType": "bytes32"
			},
			{
				"name": "minSharesQuantity",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "termsOfServiceHash",
				"type": "bytes32",
				"internalType": "bytes32"
			},
			{
				"name": "termsOfServiceSignature",
				"type": "bytes",
				"internalType": "bytes"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "comptroller",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "contract IEnzymeComptroller"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "isTermsOfServiceEnabled",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "pure"
	},
	{
		"type": "function",
		"name": "termsOfService",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "contract ITermsOfService"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "token",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "contract IEIP3009"
			}
		],
		"stateMutability": "view"
	}
] as const;
