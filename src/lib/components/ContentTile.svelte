<script lang="ts">
	import SocialIcon from './SocialIcon.svelte';

	export let title: string;
	export let icon: string;
	export let text: string;
	export let targetUrl: string;
</script>

<a href={targetUrl}>
	<SocialIcon name={icon} />
	<h3>{title}</h3>
	<div class="text">{text}</div>
</a>

<style>
	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		border: 2px solid var(--c-border-1);
		padding: 2.8rem 1.5rem;
		--social-icon-size: 64px;
	}

	a h3 {
		margin: 1rem 0 2rem 0;
	}

	a:hover h3 {
		text-decoration: underline;
	}

	.text {
		font: 400 var(--fs-ui-md);
		letter-spacing: 0.01em;
	}
</style>
