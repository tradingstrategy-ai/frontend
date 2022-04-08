<script>
	import { ethers, utils } from 'ethers';
	import erc20ABI from '../../lib/abi/erc20.json';

	let metamaskConnected = false;
	let usdcBalance = null;
	let usdcBalanceFetched = false;
	let account = null;
	let provider = null;
	let signerInit = null;

	const usdcAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';

	async function getAvailableToInvest(web3, signer, selectedAccount) {
		const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, web3);
		const balance = await usdcContract.balanceOf(selectedAccount);
		usdcBalanceFetched = true;
		return utils.formatEther(balance);
	}

  function handleWalletConnection() {
		if(!metamaskConnected) {
			connectWallet();
		} else {
			disconnectWallet();
		}
	}

  async function disconnectWallet() {
      account = null;
			metamaskConnected = false;
	}

	async function connectWallet() {
		try {
			metamaskConnected = false;
			const { ethereum } = window;
			const accountList = await ethereum.request({ method: 'eth_requestAccounts' })
			const [firstAccount] = accountList;
			account = firstAccount;
			provider = new ethers.providers.Web3Provider(ethereum);
			signerInit = await provider.getSigner();
			usdcBalance = await getAvailableToInvest(provider, signerInit, account);
			console.log(usdcBalance)
			metamaskConnected = true;
		} catch(error) {
			metamaskConnected = false;
			console.log('error connecting wallet', error);
		}
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
							<button class="btn" on:click={handleWalletConnection}>
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
