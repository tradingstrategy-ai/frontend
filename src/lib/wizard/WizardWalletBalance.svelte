<script lang="ts">
	import { EntitySymbol, WalletAddressWidget } from '$lib/components';
</script>

<div class="wizard-connect-wallet">
	<header>
		<h2>Wallet balance</h2>
	</header>
	<table>
		<tbody>
			<tr>
				<td>Account</td>
				<td><WalletAddressWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" /></td>
			</tr>
			<tr>
				<td><EntitySymbol name="USDC" size="1.5rem" type="token" /></td>
				<td>1200.18</td>
			</tr>
			<tr>
				<td><EntitySymbol name="MATIC" size="1.5rem" type="token" /></td>
				<td>682.2362</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	td:first-child {
		width: 12rem;
	}
</style>
