<script lang="ts">
	import Navbar from '../lib/header/Navbar.svelte';
	import AppHead from '../lib/header/AppHead.svelte';
    import SiteMode from "$lib/header/SiteMode.svelte";
	import '../../theme/dist/css/neumorphism.css';

</script>

<AppHead />

<div class="site-alert text-center">
    We are currently upgrading the service to a new version. Some pages and APIs might not be accessible.
</div>

<Navbar />

<slot />
<SiteMode />

<style>
    .site-alert {
        padding: 10px;
        background: red;
        color: white;
    }
</style>
