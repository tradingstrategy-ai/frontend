<script lang="ts">
	import { EntitySymbol, WalletAddressWidget } from '$lib/components';
</script>

<div class="wizard-connect-wallet">
	<header>
		<h2>Wallet balance</h2>
	</header>
	<table class="responsive">
		<tbody>
			<tr>
				<td>Account</td>
				<td><WalletAddressWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" /></td>
			</tr>
			<tr>
				<td><EntitySymbol name="MATIC" size="1.5rem" type="token" /></td>
				<td>682.2362</td>
			</tr>
			<tr>
				<td><EntitySymbol name="USDC" size="1.5rem" type="token" /></td>
				<td>1200.18</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	td:first-child {
		@media (--viewport-md-up) {
			width: 16rem;
		}
	}

	tr td:last-child {
		--cell-padding: 0 var(--space-md) 0 var(--space-xs);
		@media (--viewport-md-up) {
			text-align: right;
		}
	}
</style>
