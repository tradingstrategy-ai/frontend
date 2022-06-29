<script context="module">
	import { checkChainMaintenance } from '$lib/chain/maintenance';

	/** @type {import('@sveltejs/kit').Load} */
	export function load({ params, session }) {
		// Check chain maintenance status; if under maintenance, trigger __error
		// with a special layout and message.
		try {
			checkChainMaintenance(session.config.chainsUnderMaintenance, params.chain);
		} catch (error) {
			return { status: 503, error };
		}
		return {};
	}
</script>

<slot />
