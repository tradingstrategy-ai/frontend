<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Button from '../Button.svelte';
	import TargetableLink from '../TargetableLink.svelte';

	interface Props {
		size?: ComponentProps<Button>['size'];
		label?: string;
		href: string;
	}

	let { size = 'sm', label = 'Details', href }: Props = $props();
</script>

<Button {size} {label} {href} />
<TargetableLink {href} {label} />
