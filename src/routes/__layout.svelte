<script lang="ts">
	import Navbar from '../lib/header/Navbar.svelte';
	import AppHead from '../lib/header/AppHead.svelte';

	import '../../theme/dist/css/neumorphism.css';
</script>

<AppHead />
<Navbar />

<slot />

