<script>

    import { InputGroupAddon, InputGroup, InputGroupText, Input, Spinner} from "sveltestrap";

    import { formatUSDCBalance} from "$lib/helpers/formatters";
    import erc20ABI from '../abi/erc20.json';
    import danpoolABI from '../abi/danpool.json';

    import { defaultChainStore, web3, selectedAccount, connected, chainData, makeContractStore } from 'svelte-web3'

    let metamaskConnected = false;

    let address = null;
    let positionSize = null;
    let usdcBalance = null;
    let usdcBalanceFetched = false;
    let investedBalance = null;
    let investing = false;
    const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
    // https://polygonscan.com/address/0xe8a1331524e93b54204f4555b874657304d55fd7#code
    const poolAddress = "0xe8a1331524e93B54204F4555b874657304D55fD7";

    async function getAvailableToInvest($web3, $selectedAccount) {
        const usdc = new $web3.eth.Contract(erc20ABI, usdcAddress);
        const balance = await usdc.methods.balanceOf($selectedAccount).call();
        return formatUSDCBalance($web3, balance);
    }

    async function getInvestedBalance($web3, $selectedAccount) {
        const pool = new $web3.eth.Contract(danpoolABI, poolAddress);
        const balance = await pool.methods.totalFundValue().call();
        return formatUSDCBalance($web3, balance);
    }

    async function connect() {
      if (window.ethereum) {
          defaultChainStore.setBrowserProvider();
          metamaskConnected = true;
      }
    }

    async function init($web3, $selectedAccount) {
        if($selectedAccount) {
          usdcBalance = await getAvailableToInvest($web3, $selectedAccount);
          investedBalance = await getInvestedBalance($web3, $selectedAccount);
          usdcBalanceFetched = true;
        }
    }

    async function invest() {
        investing = true;
        const usdc = new $web3.eth.Contract(erc20ABI, usdcAddress);
        const pool = new $web3.eth.Contract(danpoolABI, poolAddress);
        const amount = new $web3.utils.BN(usdcBalance * 1000000);
        await usdc.methods.approve(poolAddress, amount).send({"from": $selectedAccount});
        await pool.methods.deposit(usdcAddress, amount).send({"from": $selectedAccount});
        init($web3, $selectedAccount);
        investing = false;
    }

    $: address = $selectedAccount;

    $: (async() => init($web3, $selectedAccount))();

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

  <p class="info">Your investment:

    {#if investedBalance}
      <strong>${investedBalance}</strong>
    {:else}
      <strong>Not available</strong>
    {/if}
  </p>

  <p class="info">USDC to invest:

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

    <button class="btn" on:click={connect} disabled={connectDisabled}>
      Connect wallet
    </button>


    <button class="btn" on:click={invest} disabled={(!connectDisabled && usdcBalanceFetched) || investing}>
      Invest
      {#if investing}
          <Spinner size="sm" />
      {/if}
    </button>

    <button class="btn" disabled={!connectDisabled}>
      Withdraw
    </button>

  </div>

  <div class="alert alert-danger" role="alert">
      <span class="alert-inner--text">
          This strategy is made for EthLisbon hackathon demo. Do not invest. The smart contract is not secure.
      </span>
    </div>

</div>

<style>
  .alert {
      margin-top: 20px;
  }
</style>