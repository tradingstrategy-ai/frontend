<script>
	import { ethers, utils } from 'ethers';
	import { InputGroup, InputGroupText, Input, Spinner } from 'sveltestrap';
	import { formatUSDCBalance } from '$lib/helpers/formatters';
	import erc20ABI from '../../lib/abi/erc20.json';

	let metamaskConnected = false;
	let usdcBalance = null;
	let usdcBalanceFetched = false;

	let walletConnected = false;
	let connectWalletError = false;
	let account = '0x000...000';
	let provider = null;
	let signerInit = null;

	const usdcAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';

	async function getAvailableToInvest(web3, signer, selectedAccount) {
		const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, web3);
		const balance = await usdcContract.balanceOf(selectedAccount);
		usdcBalanceFetched = true;
		return utils.formatEther(balance);
	}

  async function handleWalletConnection() {
		if(!walletConnected) {
			connectWallet();
		} else {
			disconnectWallet();
		}
	}

  async function disconnectWallet() {
      account = '0x000...000';
			walletConnected = false;
	}

	async function connectWallet() {
		walletConnected = false;
		const { ethereum } = window;

		await ethereum
			.request({ method: 'eth_requestAccounts' })
			.then(async (accountList) => {
				const [firstAccount] = accountList;
				account = firstAccount;
				walletConnected = true;
				provider = new ethers.providers.Web3Provider(ethereum);
				signerInit = await provider.getSigner();
				usdcBalance = await getAvailableToInvest(provider, signerInit, account);
				console.log(usdcBalance)
				metamaskConnected = true;
			})
			.catch((error) => {
				walletConnected = false;
				connectWalletError = error;
				console.log('error connecting wallet', error);
			});
	}

</script>

<div class="row">
	<div class="col-md-12">
		<div class="card-deck">
			<div class="card bg-primary shadow-soft border-light">
				<div class="card-body">
					<h5>Investor Info</h5>

					<div class="investor">
						<p class="info">
							Your address:
							{#if account}
								<strong>{account}</strong>
							{:else}
								<strong>Not connected</strong>
							{/if}
						</p>
						<p class="info">
							USDC to invest:

							{#if usdcBalanceFetched}
                {usdcBalance}
							{:else}
								<strong>Not available</strong>
							{/if}
						</p>

						<div class="buttons">
							<button class="btn" on:click={connectWallet}>
								{#if metamaskConnected}
						   		Disconnect wallet
							  {:else}
							  	Connected wallet
							  {/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.alert {
		margin-top: 20px;
	}
</style>
