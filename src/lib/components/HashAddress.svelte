<script lang="ts">
	export let address: Address;
	export let endChars = 6;

	$: sliceAt = address.length - endChars;
</script>

<span class="hash-address">
	<span>{address.slice(0, sliceAt)}</span><span>{address.slice(sliceAt)}</span>
</span>

<style lang="postcss">
	.hash-address {
		display: inline-flex;
		overflow: hidden;
		white-space: nowrap;

		& span {
			text-decoration: underline;

			&:first-child {
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}
</style>
