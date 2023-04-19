<script>
	import Button from './Button.svelte';
	import Logo from './Logo.svelte';

	$: windowInnerWidth = 0;
</script>

<svelte:window bind:innerWidth={windowInnerWidth} />

<header class="wizard-header">
	<a href="/">
		<Logo />
	</a>

	<Button
		href="https://discord.gg/en8tW6MDtw"
		icon="discord"
		label={windowInnerWidth >= 768 ? 'Get help' : undefined}
		size="sm"
		target="_blank"
	/>
</header>

<style lang="postcss">
	header {
		align-items: center;
		display: flex;
		justify-content: space-between;
		height: var(--header-height);

		@media (--viewport-md-up) {
			--logo-height: 2.375rem;
		}

		@media (--nav-collapsed) {
			--logo-height: 2rem;
		}
	}
</style>
