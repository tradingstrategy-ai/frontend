<script>
    import { onMount } from 'svelte';

    import { formatUSDCBalance} from "$lib/helpers/formatters";
    import erc20ABI from '../abi/erc20.json';

    import { defaultChainStore, web3, selectedAccount, connected, chainData, makeContractStore } from 'svelte-web3'
    // import { Contract } from "web3-eth-contract";

    let metamaskConnected = false;

    let address = null;
    let positionSize = null;
    let usdcBalance = null;
    const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";


    async function getAvailableToInvest($web3, $selectedAccount) {
        const usdc = new $web3.eth.Contract(erc20ABI, usdcAddress);
        const balance = await usdc.methods.balanceOf($selectedAccount).call();
        return balance;
    }

    async function connect() {
      if (window.ethereum) {
          defaultChainStore.setBrowserProvider();
          metamaskConnected = true;
      }
    }

    $: address = $selectedAccount;

    $: usdcBalance = $selectedAccount && getAvailableToInvest($web3, $selectedAccount);

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

  <p class="info">Position:

    {#if positionSize}
      <strong>{positionSize}</strong>
    {:else}
      <strong>Not available</strong>
    {/if}
  </p>

  <p class="info">Available USDC to invest:

    {#if usdcBalance}
      {#await usdcBalance then value}
	    <strong>{formatUSDCBalance($web3, value)}</strong>
      {/await}
    {:else}
      <strong>Not available</strong>
    {/if}
  </p>

  <div class="buttons">

    <button class="btn" on:click={connect} disabled={connectDisabled}>
      Connect
    </button>


    <button class="btn" disabled={!connectDisabled}>
      Invest
    </button>

    <button class="btn" disabled={!connectDisabled}>
      Withdraw
    </button>

  </div>

</div>