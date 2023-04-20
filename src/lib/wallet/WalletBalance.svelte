<script lang="ts">
	import { CryptoAddressWidget, EntitySymbol } from '$lib/components';
</script>

<table class="wallet-balance responsive">
	<tbody>
		<tr>
			<td>Account</td>
			<td><CryptoAddressWidget size="sm" address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" /></td>
		</tr>
		<tr>
			<td><EntitySymbol type="token" label="MATIC" slug="matic" /></td>
			<td>682.2362</td>
		</tr>
		<tr>
			<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
			<td>1200.18</td>
		</tr>
	</tbody>
</table>

<style lang="postcss">
	.wallet-balance {
		margin: 0;

		/* FIXME: remove `!important` */
		@media (--viewport-sm-up) {
			--table-font: var(--f-ui-lg-medium) !important;
		}

		& td {
			padding: var(--space-xs) var(--space-ml);
			align-content: center;

			&:first-child {
				font: var(--f-ui-md-medium);
			}

			&:last-child {
				--cell-padding: 0 var(--space-md) 0 var(--space-xs);

				@media (--viewport-md-up) {
					text-align: right;
				}
			}
		}
	}
</style>
