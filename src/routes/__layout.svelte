<script lang="ts">
	import Navbar from '$lib/header/Navbar.svelte';
	import AppHead from '$lib/header/AppHead.svelte';

	// Old imports from the Capitalgram blog website
	//import '../bootstrap.min.css';
	import '../../theme/dist/css/neumorphism.css';
	//import '../app.css';
	//import '../style.css';
</script>

<AppHead />
<Navbar />

<slot />

<style>
	main {
		margin-top: 20px;
	}
</style>