<script lang="ts">
	import { Copier } from '$lib/components';

	export let address: string;
	export let href: string;
	export let size: 'md' | 'sm' = 'md';

</script>

<address class="crypto-address-widget size-{size} tile b">
	<a {href} rel="noreferrer" target="_blank">{address}</a>
	<Copier copyText={address}/>
</address>

<style lang="postcss">
	.crypto-address-widget {
		display: grid;
		grid-auto-flow: column;
		gap: var(--space-ss);
		justify-self: flex-start;
	}

	.size-md {
		padding: var(--space-sm) var(--space-sl);
		font: var(--f-ui-lg-bold);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		@media (--viewport-sm-down) {
			padding: var(--space-ss) var(--space-sl);
			font: var(--f-ui-md-bold);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	.size-sm {
		padding: var(--space-ss) var(--space-sl);
		font: var(--f-ui-md-bold);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-sm-down) {
			padding: var(--space-xs) var(--space-sl);
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}
	}

	a {
		text-decoration: underline;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

</style>
