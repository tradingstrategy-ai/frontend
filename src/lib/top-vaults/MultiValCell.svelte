<script module lang="ts">
	type ValuesTuple = [number | null, number | null];

	export function multiValCompareFn(a: ValuesTuple, b: ValuesTuple) {
		for (let i = 0; i < a.length; i++) {
			const aVal = a[i];
			const bVal = b[i];
			if (aVal === bVal) continue;
			if (aVal === null) return -1;
			if (bVal === null) return 1;
			return aVal - bVal;
		}
		return 0;
	}
</script>

<script lang="ts">
	interface Props {
		values: ValuesTuple;
		formatter: Formatter<number | null>;
	}

	let { values, formatter }: Props = $props();
</script>

<div class="multiline">
	<div class="primary">
		{formatter(values[0])}
	</div>
	<div class="secondary">
		({formatter(values[1])})
	</div>
</div>

<style>
	.primary {
		font-weight: 600;

		&::after {
			visibility: hidden;
			content: ')';
		}
	}

	.secondary {
		color: var(--c-text-light);
	}
</style>
