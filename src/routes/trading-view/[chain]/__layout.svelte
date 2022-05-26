<script context="module">
	import { checkChainMaintenance } from '$lib/chain/maintenance';

	/** @type {import('@sveltejs/kit').Load} */
	export function load({ params }) {
		// Check for the data maintenance status.
		// If under maintenance, trigger __error with a special
		// layout and message.
		try {
			checkChainMaintenance(params.chain);
		} catch (error) {
			return { status: 503, error };
		}
		return {};
	}
</script>

<slot />
