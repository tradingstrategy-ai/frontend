<script>
  import { ethers, utils } from "ethers";
	import { InputGroupAddon, InputGroup, InputGroupText, Input, Spinner } from 'sveltestrap';

	import { formatUSDCBalance } from '$lib/helpers/formatters';
	import erc20ABI from '../abi/erc20.json';
	import danpoolABI from '../abi/danpool.json';

	let metamaskConnected = false;
  let connectDisabled = false;
	let address = null;
	let positionSize = null;
	let usdcBalance = null;
	let usdcBalanceFetched = false;
	let investedBalance = null;
	let investing = false;

  let walletConnected = false;
  let connectWalletError = false;
  let account = '';
  let provider = null;
  let signerInit = null;

	const usdcAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
	// https://polygonscan.com/address/0xe8a1331524e93b54204f4555b874657304d55fd7#code
	const poolAddress = '0x6590D62f2Af8717295563514239A71B36FA78341';

	async function getAvailableToInvest(web3, signer, selectedAccount) {
    const usdcContract = await new ethers.Contract(selectedAccount, erc20ABI, signer);
		const balance = await usdcContract.balanceOf(selectedAccount).call();
		return formatUSDCBalance(web3, balance, 6);
	}

	async function getInvestedBalance(web3, signer) {
    const pool = await new ethers.Contract(poolAddress, danpoolABI, signer);
		const balance = await pool.totalFundValue().call();
		return formatUSDCBalance(web3, balance, 8);
	}

  async function connectWallet() {
		walletConnected = false;
		const { ethereum } = window;

    await ethereum
			.request({ method: 'eth_requestAccounts' })
			.then((accountList) => {
				const [firstAccount] = accountList;
				account = firstAccount;
				walletConnected = true;
        provider = new ethers.providers.Web3Provider(ethereum);
        signerInit = provider.getSigner();
        metamaskConnected = true;
			})
			.catch((error) => {
				walletConnected = false;
				connectWalletError = error;
				console.log('error connecting wallet');
			});
	}

	async function init($web3, $selectedAccount) {
		if ($selectedAccount) {
			usdcBalance = await getAvailableToInvest($web3, $selectedAccount);
			investedBalance = await getInvestedBalance($web3, $selectedAccount);
			usdcBalanceFetched = true;
		}
	}

	async function invest() {
		// investing = true;
		// const usdc = new $web3.eth.Contract(erc20ABI, usdcAddress);
		// const pool = new $web3.eth.Contract(danpoolABI, poolAddress);
		// const amount = new $web3.utils.BN(usdcBalance * 1000000);
		// await usdc.methods.approve(poolAddress, amount).send({ from: $selectedAccount });
		// await pool.methods.deposit(usdcAddress, amount).send({ from: $selectedAccount });
		// init(web3, selectedAccount);
		// investing = false;
	}

	  $: address = account;

	  // $: (async () => init($web3, $selectedAccount))();

  	$: connectDisabled = metamaskConnected;
</script>

<div class="investor">
	<p class="info">
		Your address:
		{#if address}
			<strong>{address}</strong>
		{:else}
			<strong>Not connected</strong>
		{/if}
	</p>

	<p class="info">
		Your investment:

		{#if investedBalance}
			<strong>${investedBalance}</strong>
		{:else}
			<strong>Not available</strong>
		{/if}
	</p>

	<p class="info">
		USDC to invest:

		{#if usdcBalanceFetched}
			<InputGroup>
				<InputGroupText>$</InputGroupText>
				<Input placeholder="Amount" type="text" bind:value={usdcBalance} />
			</InputGroup>
		{:else}
			<strong>Not available</strong>
		{/if}
	</p>

	<div class="buttons">
		<button class="btn" on:click={connectWallet} disabled={connectDisabled}> Connect wallet </button>

		<button
			class="btn"
			on:click={invest}
			disabled={(!connectDisabled && usdcBalanceFetched) || investing}
		>
			Invest
			{#if investing}
				<Spinner size="sm" />
			{/if}
		</button>

		<button class="btn" disabled={!connectDisabled}> Withdraw </button>
	</div>

	<div class="alert alert-danger" role="alert">
		<span class="alert-inner--text">
			This strategy is made for EthLisbon hackathon demo. Do not invest. The smart contract is not
			secure.
		</span>
	</div>
</div>

<style>
	.alert {
		margin-top: 20px;
	}
</style>
