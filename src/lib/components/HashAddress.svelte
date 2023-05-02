<script lang="ts">
	export let address: string;
</script>

<span class="hash-address">
	<span class="start">{address}</span>
	<span class="end">
		{address}
	</span>
</span>

<style lang="postcss">
	.hash-address {
		display: flex;
		overflow: hidden;
		justify-content: center;
		width: 100%;

		& :is(.start, .end) {
			text-decoration: underline;
			overflow: hidden;
			white-space: nowrap;
		}

		& .start {
			text-overflow: ellipsis;
		}

		& .end {
			/* --end-fixed-chars: 4; */
			--font-face-scale-factor: 0.7;
			--end-width: calc(1em * var(--font-face-scale-factor) * var(--end-fixed-chars));
			direction: rtl;
			max-width: var(--end-width);
			text-overflow: '';
		}
	}
</style>
