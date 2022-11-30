<script>
	import Button from '$lib/components/Button.svelte';

	const data = [
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		},
		{
			Id: 209,
			Ticker: 'ETH-SOL',
			Profitability: '0.0%',
			Value: '0.0%',
			Opened: '2022-11-29 10:00'
		}
	];
</script>

<div>
	<table>
		<thead>
			<tr>
				{#each Object.keys(data[0]) as key, i}
					<th class:align-left={i < 2}>{key}</th>
				{/each}
				<th />
			</tr>
		</thead>
		<tbody>
			{#each data as item}
				<tr>
					{#each Object.values(item) as value, i}
						<td class:align-left={i < 2}>{value}</td>
					{/each}
					<td><Button tertiary>Details</Button></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
</style>
