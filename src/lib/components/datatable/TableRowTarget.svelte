<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Button from '../Button.svelte';
	import TargetableLink from '../TargetableLink.svelte';

	export let size: ComponentProps<Button>['size'] = 'sm';
	export let label = 'Details';
	export let href: string;
</script>

<Button {size} {label} {href} />
<TargetableLink {href} {label} class="foo" />
