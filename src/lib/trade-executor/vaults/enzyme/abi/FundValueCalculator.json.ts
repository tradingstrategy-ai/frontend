// FundValueCalculator.json exported `as const` for proper typing with viem/@wagmi
export default [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_feeManager",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_protocolFeeTracker",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_valueInterpreter",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vaultProxy",
				"type": "address"
			}
		],
		"name": "calcGav",
		"outputs": [
			{
				"internalType": "address",
				"name": "denominationAsset_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "gav_",
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
				"name": "_vaultProxy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_quoteAsset",
				"type": "address"
			}
		],
		"name": "calcGavInAsset",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "gav_",
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
				"name": "_vaultProxy",
				"type": "address"
			}
		],
		"name": "calcGrossShareValue",
		"outputs": [
			{
				"internalType": "address",
				"name": "denominationAsset_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "grossShareValue_",
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
				"name": "_vaultProxy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_quoteAsset",
				"type": "address"
			}
		],
		"name": "calcGrossShareValueInAsset",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "grossShareValue_",
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
				"name": "_vaultProxy",
				"type": "address"
			}
		],
		"name": "calcNav",
		"outputs": [
			{
				"internalType": "address",
				"name": "denominationAsset_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "nav_",
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
				"name": "_vaultProxy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_quoteAsset",
				"type": "address"
			}
		],
		"name": "calcNavInAsset",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "nav_",
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
				"name": "_vaultProxy",
				"type": "address"
			}
		],
		"name": "calcNetShareValue",
		"outputs": [
			{
				"internalType": "address",
				"name": "denominationAsset_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "netShareValue_",
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
				"name": "_vaultProxy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_quoteAsset",
				"type": "address"
			}
		],
		"name": "calcNetShareValueInAsset",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "netShareValue_",
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
				"name": "_vaultProxy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_sharesHolder",
				"type": "address"
			}
		],
		"name": "calcNetValueForSharesHolder",
		"outputs": [
			{
				"internalType": "address",
				"name": "denominationAsset_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "netValue_",
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
				"name": "_vaultProxy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_sharesHolder",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_quoteAsset",
				"type": "address"
			}
		],
		"name": "calcNetValueForSharesHolderInAsset",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "netValue_",
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
				"name": "_vaultProxy",
				"type": "address"
			}
		],
		"name": "calcProtocolFeeDueForFund",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "sharesDue_",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFeeManager",
		"outputs": [
			{
				"internalType": "address",
				"name": "feeManager_",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getProtocolFeeTracker",
		"outputs": [
			{
				"internalType": "address",
				"name": "protocolFeeTracker_",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getValueInterpreter",
		"outputs": [
			{
				"internalType": "address",
				"name": "valueInterpreter_",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;
