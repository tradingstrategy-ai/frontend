// VaultUSDCPaymentForwarder.json exported `as const` for proper typing with viem/@wagmi
export default [
	{
		"inputs": [
			{
				"internalType": "contract IEIP3009",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "contract IEnzymeComptroller",
				"name": "_comptroller",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "amountProxied",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "validAfter",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "validBefore",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "nonce",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "minSharesQuantity",
				"type": "uint256"
			}
		],
		"name": "buySharesOnBehalfUsingReceiveWithAuthorization",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "validAfter",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "validBefore",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "nonce",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "minSharesQuantity",
				"type": "uint256"
			}
		],
		"name": "buySharesOnBehalfUsingTransferWithAuthorization",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "comptroller",
		"outputs": [
			{
				"internalType": "contract IEnzymeComptroller",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IEIP3009",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;
