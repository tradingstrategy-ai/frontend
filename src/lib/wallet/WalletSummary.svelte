<script lang="ts">
	import { AlertItem, AlertList, CryptoAddressWidget, EntitySymbol } from '$lib/components';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let slug: string;
	export let name: string;

	let wrongNetwork = true;
</script>

<table class="wallet-summary responsive">
	<tbody>
		<tr>
			<td>Wallet</td>
			<td class="wallet-data">
				<img alt={name} src={getLogoUrl(slug)} />
				{name}
				<span class="status">
					<div class="dot" />
					Connected
				</span>
			</td>
		</tr>
		<tr>
			<td>Account</td>
			<td>
				<CryptoAddressWidget size="sm" address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" />
			</td>
		</tr>
		<tr>
			<td>Blockchain</td>
			<td>
				{#if wrongNetwork}
					<div
						class="wrong-network-alert"
						on:click={() => (wrongNetwork = false)}
						on:keydown={() => (wrongNetwork = false)}
					>
						<AlertList size="xs" status="error">
							<AlertItem>Wrong network! Please connect to Polygon</AlertItem>
						</AlertList>
					</div>
				{:else}
					<EntitySymbol type="blockchain" label="Polygon" slug="polygon" />
				{/if}
			</td>
		</tr>
	</tbody>
</table>

<style lang="postcss">
	.wallet-summary {
		margin: 0;

		/* FIXME: remove `!important` */
		@media (--viewport-sm-up) {
			--table-font: var(--f-ui-lg-medium) !important;
		}

		/* FIXME: remove `!important` (check 527 < viewport < 511) */
		& tr {
			grid-template-columns: repeat(auto-fit, minmax(max(25%, 14rem), 1fr)) !important;
		}

		& td {
			padding: var(--space-xs) var(--space-ml);
			align-content: center;

			&:first-child {
				font: var(--f-ui-md-medium);
			}
		}
	}

	.wallet-data {
		align-items: center;
		display: flex;
		gap: var(--space-sm);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
		}

		& img {
			width: 2rem;

			@media (--viewport-sm-down) {
				width: 1.75rem;
			}
		}
	}

	.status {
		align-items: center;
		background: hsla(var(--hsl-success), 0.2);
		border-radius: var(--space-md);
		color: hsla(var(--hsl-success));
		display: flex;
		font: var(--f-ui-sm-medium);
		gap: var(--space-ss);
		margin-left: var(--space-sm);
		padding: var(--space-xs) var(--space-sl);

		& .dot {
			animation: pulse-opacity 1.5s ease-out infinite;
			background: hsla(var(--hsl-success));
			border-radius: 100%;
			height: 0.625rem;
			width: 0.625rem;
		}
	}

	.wrong-network-alert {
		display: inline-flex;
		word-break: normal;
	}
</style>