// Vault.json exported `as const` for proper typing with viem/@wagmi
export const vaultAbi = [
	{
		"type": "constructor",
		"inputs": [
			{
				"name": "disable",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "MAX_MANAGEMENT_RATE",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint16",
				"internalType": "uint16"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "MAX_PERFORMANCE_RATE",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint16",
				"internalType": "uint16"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "MAX_PROTOCOL_RATE",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint16",
				"internalType": "uint16"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "acceptOwnership",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "addToWhitelist",
		"inputs": [
			{
				"name": "accounts",
				"type": "address[]",
				"internalType": "address[]"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "allowance",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "spender",
				"type": "address",
				"internalType": "address"
			}
		],
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
		"name": "approve",
		"inputs": [
			{
				"name": "spender",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "value",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "asset",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "balanceOf",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"internalType": "address"
			}
		],
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
		"name": "cancelRequestDeposit",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "claimableDepositRequest",
		"inputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "claimableRedeemRequest",
		"inputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "close",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "convertToAssets",
		"inputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
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
		"name": "convertToAssets",
		"inputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
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
		"name": "convertToShares",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
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
		"name": "convertToShares",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
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
		"name": "decimals",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint8",
				"internalType": "uint8"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "deposit",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
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
		"name": "deposit",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
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
		"name": "depositEpochId",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint40",
				"internalType": "uint40"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "disableWhitelist",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "epochSettleId",
		"inputs": [
			{
				"name": "epochId",
				"type": "uint40",
				"internalType": "uint40"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint40",
				"internalType": "uint40"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "feeRates",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "tuple",
				"internalType": "struct Rates",
				"components": [
					{
						"name": "managementRate",
						"type": "uint16",
						"internalType": "uint16"
					},
					{
						"name": "performanceRate",
						"type": "uint16",
						"internalType": "uint16"
					}
				]
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getRolesStorage",
		"inputs": [],
		"outputs": [
			{
				"name": "_rolesStorage",
				"type": "tuple",
				"internalType": "struct Roles.RolesStorage",
				"components": [
					{
						"name": "whitelistManager",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "feeReceiver",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "safe",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "feeRegistry",
						"type": "address",
						"internalType": "contract FeeRegistry"
					},
					{
						"name": "valuationManager",
						"type": "address",
						"internalType": "address"
					}
				]
			}
		],
		"stateMutability": "pure"
	},
	{
		"type": "function",
		"name": "highWaterMark",
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
		"name": "initialize",
		"inputs": [
			{
				"name": "init",
				"type": "tuple",
				"internalType": "struct Vault.InitStruct",
				"components": [
					{
						"name": "underlying",
						"type": "address",
						"internalType": "contract IERC20"
					},
					{
						"name": "name",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "symbol",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "safe",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "whitelistManager",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "valuationManager",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "admin",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "feeReceiver",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "feeRegistry",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "wrappedNativeToken",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "managementRate",
						"type": "uint16",
						"internalType": "uint16"
					},
					{
						"name": "performanceRate",
						"type": "uint16",
						"internalType": "uint16"
					},
					{
						"name": "enableWhitelist",
						"type": "bool",
						"internalType": "bool"
					},
					{
						"name": "rateUpdateCooldown",
						"type": "uint256",
						"internalType": "uint256"
					}
				]
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "initiateClosing",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "isOperator",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "operator",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "isWhitelistActivated",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "isWhitelisted",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "lastDepositRequestId",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint40",
				"internalType": "uint40"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "lastFeeTime",
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
		"name": "lastRedeemRequestId",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint40",
				"internalType": "uint40"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "maxDeposit",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
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
		"name": "maxMint",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
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
		"name": "maxRedeem",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
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
		"name": "maxWithdraw",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			}
		],
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
		"name": "mint",
		"inputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
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
		"name": "mint",
		"inputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
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
		"name": "name",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "string",
				"internalType": "string"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "owner",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "pause",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "paused",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "pendingDepositRequest",
		"inputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "pendingOwner",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "pendingRedeemRequest",
		"inputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "pendingSilo",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "previewDeposit",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "pure"
	},
	{
		"type": "function",
		"name": "previewMint",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "pure"
	},
	{
		"type": "function",
		"name": "previewRedeem",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "pure"
	},
	{
		"type": "function",
		"name": "previewWithdraw",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "pure"
	},
	{
		"type": "function",
		"name": "redeem",
		"inputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "redeemEpochId",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint40",
				"internalType": "uint40"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "renounceOwnership",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "requestDeposit",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "payable"
	},
	{
		"type": "function",
		"name": "requestDeposit",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "referral",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "payable"
	},
	{
		"type": "function",
		"name": "requestRedeem",
		"inputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "revokeFromWhitelist",
		"inputs": [
			{
				"name": "accounts",
				"type": "address[]",
				"internalType": "address[]"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "setOperator",
		"inputs": [
			{
				"name": "operator",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "approved",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"outputs": [
			{
				"name": "success",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "settleDeposit",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "settleRedeem",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "share",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "supportsInterface",
		"inputs": [
			{
				"name": "interfaceId",
				"type": "bytes4",
				"internalType": "bytes4"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "symbol",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "string",
				"internalType": "string"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "totalAssets",
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
		"name": "totalSupply",
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
		"name": "transfer",
		"inputs": [
			{
				"name": "to",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "value",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "transferFrom",
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
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "transferOwnership",
		"inputs": [
			{
				"name": "newOwner",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "unpause",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "updateFeeReceiver",
		"inputs": [
			{
				"name": "_feeReceiver",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "updateNewTotalAssets",
		"inputs": [
			{
				"name": "_newTotalAssets",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "updateRates",
		"inputs": [
			{
				"name": "newRates",
				"type": "tuple",
				"internalType": "struct Rates",
				"components": [
					{
						"name": "managementRate",
						"type": "uint16",
						"internalType": "uint16"
					},
					{
						"name": "performanceRate",
						"type": "uint16",
						"internalType": "uint16"
					}
				]
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "updateValuationManager",
		"inputs": [
			{
				"name": "_valuationManager",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "updateWhitelistManager",
		"inputs": [
			{
				"name": "_whitelistManager",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "withdraw",
		"inputs": [
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "controller",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "event",
		"name": "Approval",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "spender",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "value",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Deposit",
		"inputs": [
			{
				"name": "sender",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "assets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "shares",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "DepositRequest",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "requestId",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "sender",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			},
			{
				"name": "assets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "DepositRequestCanceled",
		"inputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "controller",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "FeeReceiverUpdated",
		"inputs": [
			{
				"name": "oldReceiver",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			},
			{
				"name": "newReceiver",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "HighWaterMarkUpdated",
		"inputs": [
			{
				"name": "oldHighWaterMark",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "newHighWaterMark",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Initialized",
		"inputs": [
			{
				"name": "version",
				"type": "uint64",
				"indexed": false,
				"internalType": "uint64"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "NewTotalAssetsUpdated",
		"inputs": [
			{
				"name": "totalAssets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "OperatorSet",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "operator",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "approved",
				"type": "bool",
				"indexed": false,
				"internalType": "bool"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "OwnershipTransferStarted",
		"inputs": [
			{
				"name": "previousOwner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "newOwner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "OwnershipTransferred",
		"inputs": [
			{
				"name": "previousOwner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "newOwner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Paused",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "RatesUpdated",
		"inputs": [
			{
				"name": "oldRates",
				"type": "tuple",
				"indexed": false,
				"internalType": "struct Rates",
				"components": [
					{
						"name": "managementRate",
						"type": "uint16",
						"internalType": "uint16"
					},
					{
						"name": "performanceRate",
						"type": "uint16",
						"internalType": "uint16"
					}
				]
			},
			{
				"name": "newRate",
				"type": "tuple",
				"indexed": false,
				"internalType": "struct Rates",
				"components": [
					{
						"name": "managementRate",
						"type": "uint16",
						"internalType": "uint16"
					},
					{
						"name": "performanceRate",
						"type": "uint16",
						"internalType": "uint16"
					}
				]
			},
			{
				"name": "timestamp",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "RedeemRequest",
		"inputs": [
			{
				"name": "controller",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "requestId",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "sender",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			},
			{
				"name": "shares",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Referral",
		"inputs": [
			{
				"name": "referral",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "requestId",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "assets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "SettleDeposit",
		"inputs": [
			{
				"name": "epochId",
				"type": "uint40",
				"indexed": true,
				"internalType": "uint40"
			},
			{
				"name": "settledId",
				"type": "uint40",
				"indexed": true,
				"internalType": "uint40"
			},
			{
				"name": "totalAssets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "totalSupply",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "assetsDeposited",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "sharesMinted",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "SettleRedeem",
		"inputs": [
			{
				"name": "epochId",
				"type": "uint40",
				"indexed": true,
				"internalType": "uint40"
			},
			{
				"name": "settledId",
				"type": "uint40",
				"indexed": true,
				"internalType": "uint40"
			},
			{
				"name": "totalAssets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "totalSupply",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "assetsWithdrawed",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "sharesBurned",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "StateUpdated",
		"inputs": [
			{
				"name": "state",
				"type": "uint8",
				"indexed": false,
				"internalType": "enum State"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "TotalAssetsUpdated",
		"inputs": [
			{
				"name": "totalAssets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Transfer",
		"inputs": [
			{
				"name": "from",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "to",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "value",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Unpaused",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "ValuationManagerUpdated",
		"inputs": [
			{
				"name": "oldManager",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			},
			{
				"name": "newManager",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "WhitelistDisabled",
		"inputs": [],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "WhitelistManagerUpdated",
		"inputs": [
			{
				"name": "oldManager",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			},
			{
				"name": "newManager",
				"type": "address",
				"indexed": false,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "WhitelistUpdated",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "authorized",
				"type": "bool",
				"indexed": false,
				"internalType": "bool"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Withdraw",
		"inputs": [
			{
				"name": "sender",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "receiver",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "owner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "assets",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "shares",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "error",
		"name": "AboveMaxRate",
		"inputs": [
			{
				"name": "maxRate",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "AddressEmptyCode",
		"inputs": [
			{
				"name": "target",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "AddressInsufficientBalance",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "CantDepositNativeToken",
		"inputs": []
	},
	{
		"type": "error",
		"name": "Closed",
		"inputs": []
	},
	{
		"type": "error",
		"name": "ERC20InsufficientAllowance",
		"inputs": [
			{
				"name": "spender",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "allowance",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "needed",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC20InsufficientBalance",
		"inputs": [
			{
				"name": "sender",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "balance",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "needed",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC20InvalidApprover",
		"inputs": [
			{
				"name": "approver",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC20InvalidReceiver",
		"inputs": [
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC20InvalidSender",
		"inputs": [
			{
				"name": "sender",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC20InvalidSpender",
		"inputs": [
			{
				"name": "spender",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC4626ExceededMaxDeposit",
		"inputs": [
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "max",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC4626ExceededMaxMint",
		"inputs": [
			{
				"name": "receiver",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "max",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC4626ExceededMaxRedeem",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "shares",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "max",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC4626ExceededMaxWithdraw",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "assets",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "max",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "ERC7540InvalidOperator",
		"inputs": []
	},
	{
		"type": "error",
		"name": "ERC7540PreviewDepositDisabled",
		"inputs": []
	},
	{
		"type": "error",
		"name": "ERC7540PreviewMintDisabled",
		"inputs": []
	},
	{
		"type": "error",
		"name": "ERC7540PreviewRedeemDisabled",
		"inputs": []
	},
	{
		"type": "error",
		"name": "ERC7540PreviewWithdrawDisabled",
		"inputs": []
	},
	{
		"type": "error",
		"name": "EnforcedPause",
		"inputs": []
	},
	{
		"type": "error",
		"name": "ExpectedPause",
		"inputs": []
	},
	{
		"type": "error",
		"name": "FailedInnerCall",
		"inputs": []
	},
	{
		"type": "error",
		"name": "InvalidInitialization",
		"inputs": []
	},
	{
		"type": "error",
		"name": "MathOverflowedMulDiv",
		"inputs": []
	},
	{
		"type": "error",
		"name": "NewTotalAssetsMissing",
		"inputs": []
	},
	{
		"type": "error",
		"name": "NotClosing",
		"inputs": [
			{
				"name": "currentState",
				"type": "uint8",
				"internalType": "enum State"
			}
		]
	},
	{
		"type": "error",
		"name": "NotInitializing",
		"inputs": []
	},
	{
		"type": "error",
		"name": "NotOpen",
		"inputs": [
			{
				"name": "currentState",
				"type": "uint8",
				"internalType": "enum State"
			}
		]
	},
	{
		"type": "error",
		"name": "NotWhitelisted",
		"inputs": []
	},
	{
		"type": "error",
		"name": "OnlyOneRequestAllowed",
		"inputs": []
	},
	{
		"type": "error",
		"name": "OnlySafe",
		"inputs": [
			{
				"name": "safe",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "OnlyValuationManager",
		"inputs": [
			{
				"name": "valuationManager",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "OnlyWhitelistManager",
		"inputs": [
			{
				"name": "whitelistManager",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "OwnableInvalidOwner",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "OwnableUnauthorizedAccount",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "RequestIdNotClaimable",
		"inputs": []
	},
	{
		"type": "error",
		"name": "RequestNotCancelable",
		"inputs": [
			{
				"name": "requestId",
				"type": "uint256",
				"internalType": "uint256"
			}
		]
	},
	{
		"type": "error",
		"name": "SafeERC20FailedOperation",
		"inputs": [
			{
				"name": "token",
				"type": "address",
				"internalType": "address"
			}
		]
	}
] as const;
