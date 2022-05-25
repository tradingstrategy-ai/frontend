<script context="module">
  import { checkChainMaintenance } from "$lib/chain/maintenance";

  /** @type {import('@sveltejs/kit').Load} */
  export function load({ params }) {
    // Check if we should tell user to go away from this page
    try {
      checkChainMaintenance(params.chain);
    } catch(error) {
      return { status: 503, error };
    }
    return {};
  }
</script>

<slot />
