<script lang="ts">
	import TargetableLink from '../TargetableLink.svelte';

	interface Props {
		label?: string;
		href: string;
		target?: string;
		rel?: string;
	}

	let { label = 'Details', href, target, rel }: Props = $props();
</script>

<a class="row-link" {href} {target} {rel}>{label}</a>
<TargetableLink {href} {label} {target} {rel} />

<style>
	.row-link {
		color: var(--c-text);
		text-decoration: underline;
		font: var(--table-font, var(--f-ui-md-medium));
		letter-spacing: var(--table-letter-spacing, var(--f-ui-md-spacing, normal));
		padding-right: var(--space-md);
		position: relative;
		z-index: 2;
	}
</style>
