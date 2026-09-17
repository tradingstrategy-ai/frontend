<script lang="ts">
	import TargetableLink from '../TargetableLink.svelte';

	interface Props {
		label?: string;
		/** Accessible label for both links when the visible label is intentionally brief. */
		targetLabel?: string;
		href: string;
		target?: string;
		rel?: string;
	}

	let { label = 'Details', targetLabel = label, href, target, rel }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is a resolved path passed in by the caller -->
<a class="row-link" aria-label={targetLabel} {href} {target} {rel}>{label}</a>
<TargetableLink {href} label={targetLabel} {target} {rel} />

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
