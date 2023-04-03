<script lang="ts">
	import { SmartContractWidget } from '$lib/components';
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
				<td><SmartContractWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" /></td>
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
