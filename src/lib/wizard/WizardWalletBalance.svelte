<script lang="ts">
	import WalletTile from '$lib/components/WalletTile.svelte';
	import MetaMaskLogo from '$lib/assets/logos/metamask.svg';
	import WalletConnectLogo from '$lib/assets/logos/walletconnect.svg';
	import { Button } from '$lib/components';

	$: chosenWallet = '';

	function chooseWallet(name: string) {
		chosenWallet = name;
	}

	function resetWallet() {
		chosenWallet = '';
	}
</script>

<div class="wizard-connect-wallet">
	<header>
		<h2>Wallet balance</h2>
		<p>Currently your wallet has:</p>
	</header>
	<table>
		<tbody>
			<tr>
				<td>Account</td>
				<td>Account</td>
			</tr>
			<tr>
				<td>MATIC</td>
				<td>200 MATIC</td>
			</tr>
			<tr>
				<td>ETH</td>
				<td>15 ETH</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	td:first-child {
		width: 12rem;
	}
</style>
