<!--
@component
Test helper component for Tooltip slot content.
Used by Tooltip.test.ts to verify that popup content is rendered lazily.
-->
<script lang="ts">
	import Tooltip from './Tooltip.svelte';
</script>

<Tooltip>
	<span slot="trigger">Trigger</span>
	<svelte:fragment slot="popup">Popup body</svelte:fragment>
</Tooltip>
