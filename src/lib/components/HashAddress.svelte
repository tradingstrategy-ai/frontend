<script lang="ts">
	import type { Address } from '@wagmi/core';

	export let address: Address;
	export let endChars = 6;
</script>

<span class="hash-address">
	<span class="start">{address.slice(0, address.length - endChars)}</span>
	<span class="end">
		{address.slice(address.length - endChars, address.length)}
	</span>
</span>

<style lang="postcss">
	.hash-address {
		display: flex;
		width: 100%;

		& :is(.start, .end) {
			text-decoration: underline;
		}
		& :is(.start) {
			overflow: hidden;
			white-space: nowrap;
		}

		& .start {
			text-overflow: ellipsis;
		}
	}
</style>
