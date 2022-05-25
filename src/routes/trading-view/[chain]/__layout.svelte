<script context="module">
  import { checkChainMaintenance } from "$lib/chain/maintenance";

  /** @type {import('@sveltejs/kit').Load} */
  export function load({ params }) {
    // Check if we should tell user to go away from this page
    checkChainMaintenance(params.chain);
    return {};
  }
</script>

<slot />
