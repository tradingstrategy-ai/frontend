<script lang="ts">
	import { Button, EntitySymbol, WizardActions, WalletAddressWidget } from '$lib/components';
</script>

<table class="wallet-connect-ballance responsive">
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

<WizardActions>
	<Button ghost>Cancel</Button>
	<Button secondary href="connect">Back</Button>
	<Button href="finish">Next</Button>
</WizardActions>

<style lang="postcss">
	.wallet-connect-ballance {
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

		/* FIXME: remove :global override (expose style options on AddressWidget) */
		& :global .hash-widget {
			& a {
				@media (--viewport-sm-down) {
					font: var(--f-ui-sm-bold) !important;
				}
			}

			& address {
				@media (--viewport-md-up) {
					max-width: min(32rem, calc(100vw - 35rem));
				}
			}
		}
	}
</style>
