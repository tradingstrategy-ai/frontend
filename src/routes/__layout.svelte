<script lang="ts">
	import Navbar from '../components/header/Navbar.svelte';
	import AppHead from '../components/header/AppHead.svelte';

	import '../../theme/dist/css/neumorphism.css';
</script>

<AppHead />
<Navbar />

<slot />

