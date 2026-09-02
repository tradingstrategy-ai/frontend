<!--
@component
Render the bundled logo for a fixed vault-comparison benchmark.
-->
<script lang="ts">
	import btcLogo from '$lib/assets/logos/tokens/btc.svg';
	import ethLogo from '$lib/assets/logos/tokens/eth.svg';
	import usTreasuryLogo from '$lib/assets/logos/tokens/us-treasury.svg';
	import type { ComparisonBenchmark } from './types';

	let { benchmark }: { benchmark: ComparisonBenchmark } = $props();

	const logoUrls: Record<ComparisonBenchmark, string> = {
		treasury: usTreasuryLogo,
		eth: ethLogo,
		btc: btcLogo
	};
</script>

<img class="benchmark-logo" src={logoUrls[benchmark]} data-benchmark={benchmark} alt="" aria-hidden="true" />

<style>
	.benchmark-logo {
		width: 1.25rem;
		height: 1.25rem;
		flex: 0 0 auto;
		object-fit: contain;
	}
</style>
