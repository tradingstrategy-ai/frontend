<script lang="ts">
	interface Props {
		label: string;
		data: unknown;
	}

	let { label, data }: Props = $props();

	function serialize(value: unknown) {
		return (JSON.stringify(value, null, 2) ?? 'null').replaceAll('<', '\\u003C');
	}

	let serialized = $derived(serialize(data));
</script>

<pre hidden aria-hidden="true" data-debug-freshness={label}>{serialized}</pre>
