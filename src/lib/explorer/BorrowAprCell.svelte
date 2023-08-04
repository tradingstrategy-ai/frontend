<script lang="ts">
	import type { LendingReserve } from './lending-reserve-client';
	import { isBorrowable } from '$lib/helpers/lending-reserve';
	import { formatInterestRate } from '$lib/helpers/formatters';
	import { Tooltip } from '$lib/components';

	export let apr: number;
	export let reserve: LendingReserve;
</script>

{#if !reserve.additional_details}
	---
{:else if !isBorrowable(reserve)}
	<Tooltip>
		<span slot="trigger" class="underline">N/A</span>
		<svelte:fragment slot="popup">Non-borrowable reserve</svelte:fragment>
	</Tooltip>
{:else}
	{formatInterestRate(apr)}
{/if}
