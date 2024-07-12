<script lang="ts">
	import IconWarning from '~icons/local/warning';

	export let title: string;
</script>

<div class="deposit-warning">
	<h3>
		<IconWarning />
		{title}
	</h3>
	<p><slot /></p>
</div>

<style lang="postcss">
	.deposit-warning {
		display: grid;
		gap: 0.5rem;
		align-content: flex-start;
		font: var(--f-ui-md-roman);
		letter-spacing: var(--ls-ui-md, normal);
	}

	h3 {
		display: flex;
		gap: 0.75ex;
		align-items: center;
		font-weight: bold;
	}
</style>
