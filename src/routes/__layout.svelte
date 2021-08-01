<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Navbar from '$lib/header/Navbar.svelte';
	// Old imports from the blog website
	import '../bootstrap.min.css';
	import '../theme.css';
	import '../style.css';
	// Going forward with the ap from here
	// import '../app.css';
</script>

<Navbar />

<main>
	<slot />
</main>

<style>
	main {
		margin-top: 20px;
	}
</style>