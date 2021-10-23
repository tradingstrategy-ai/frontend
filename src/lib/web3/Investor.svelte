<script>

    import { InputGroupAddon, InputGroup, InputGroupText, Input, Spinner} from "sveltestrap";

    import { formatUSDCBalance} from "$lib/helpers/formatters";
    import erc20ABI from '../abi/erc20.json';

    import { defaultChainStore, web3, selectedAccount, connected, chainData, makeContractStore } from 'svelte-web3'

    let metamaskConnected = false;

    let address = null;
    let positionSize = null;
    let usdcBalance = null;
    let usdcBalanceFetched = false;
    let investing = false;
    const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
    const poolAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

    async function getAvailableToInvest($web3, $selectedAccount) {
        const usdc = new $web3.eth.Contract(erc20ABI, usdcAddress);
        const balance = await usdc.methods.balanceOf($selectedAccount).call();
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
          usdcBalanceFetched = true;
        }
    }

    async function invest() {
        investing = true;
        const usdc = new $web3.eth.Contract(erc20ABI, usdcAddress);
        const amount = new $web3.utils.BN(usdcBalance * 1000000);
        await usdc.methods.approve(poolAddress, amount).send({"from": $selectedAccount});
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

  <p class="info">Your position:

    {#if positionSize}
      <strong>{positionSize}</strong>
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


    <button class="btn" on:click={invest} disabled={!connectDisabled && !investing && usdcBalanceFetched}>
      Invest
      {#if investing}
          <Spinner />
      {/if}
    </button>

    <button class="btn" disabled={!connectDisabled}>
      Withdraw
    </button>

  </div>

</div>