<script lang="ts">
	import type { SubmitFunction } from '$app/forms';
	import { enhance } from '$app/forms';
	import fsm from 'svelte-fsm';
	import { Dialog, TextInput, Button, AlertList, AlertItem } from '$lib/components';
	import { tick } from 'svelte';

	export let open = false;

	let form: HTMLFormElement;
	let title: string;
	let email: string;
	let errorMessage: string;

	// finite state machine to manage form states/transitions
	// see: https://github.com/kenkunz/svelte-fsm/wiki
	const state = fsm('initial', {
		initial: {
			_enter() {
				title = 'Trading Strategy Newsletter';
				email = '';
			},
			submit: 'submitting'
		},

		submitting: {
			success: 'subscribed',
			invalid: 'failed',
			error: 'failed'
		},

		subscribed: {
			_enter() {
				title = 'Thank you!';
			},
			reset: 'initial'
		},

		failed: {
			_enter({ args }) {
				const { data, error } = args[0];
				errorMessage = (data || error)?.message || 'The subscription request failed.';
			},
			_exit() {
				errorMessage = '';
			},
			submit: 'submitting'
		}
	});

	/**
	 * Client-side progressively-enhanced form submit handling; see:
	 * https://kit.svelte.dev/docs/form-actions#progressive-enhancement
	 */
	const enhancedSubmit: SubmitFunction = () => {
		state.submit();
		// @ts-ignore
		return ({ result }) => state[result.type](result);
	};

	async function handleOpen() {
		await tick();
		form?.email.focus();
	}
</script>

<Dialog {title} bind:open on:open={handleOpen} on:close={state.reset}>
	<div class="dialog-inner {$state}">
		{#if $state !== 'subscribed'}
			<p>Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.</p>
			<form bind:this={form} method="POST" action="/newsletter" use:enhance={enhancedSubmit}>
				<TextInput
					bind:value={email}
					size="lg"
					type="email"
					name="email"
					placeholder="email@example.org"
					autocomplete="off"
					required
					disabled={$state === 'submitting'}
				/>
				<Button sm submit label="Subscribe" disabled={$state === 'submitting'} />
			</form>
		{:else}
			<p>
				You have successfully joined our newsletter list and will begin receiving the lastest updates and insights from
				Trading Strategy.
			</p>
		{/if}

		<div class="dialog-error">
			<AlertList>
				<AlertItem displayWhen={$state === 'failed'}>{errorMessage}</AlertItem>
			</AlertList>
		</div>
	</div>
</Dialog>

<style lang="postcss">
	.dialog-inner p {
		margin-bottom: 1rem;
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: var(--c-text-light);

		@media (--viewport-xs) {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	.dialog-error :global(.alert-list) {
		margin-top: 1rem;
		padding: 1rem;
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
	}

	form {
		padding-block: 0.5rem;
		display: grid;
		grid-template-columns: 1fr 7.5rem;
		gap: 0.75rem;
		align-items: center;

		@media (--viewport-xs) {
			grid-template-columns: auto;
			gap: 1rem;
		}
	}

	.submitting {
		&,
		& :global(input[disabled]),
		& :global(button[disabled]) {
			cursor: wait;
		}
	}
</style>
