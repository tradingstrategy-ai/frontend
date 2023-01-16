<!--
@component
Form is intended to be used as a global singleton component (add to layout).
The sibling `controller` file exports a `toggleSubscriptionDialog` function, which can
be invoked from anywhere to open the global dialog component.

#### Usage:
```tsx
<Form />
```
-->
<script lang="ts">
	import type { SubmitFunction } from '$app/forms';
	import { enhance } from '$app/forms';
	import fsm from 'svelte-fsm';
	import { TextInput, Button, AlertList, AlertItem } from '$lib/components';
	import { tick } from 'svelte';

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

{#if $state !== 'subscribed'}
	<form bind:this={form} method="POST" action="/newsletter/subscribe" use:enhance={enhancedSubmit}>
		<TextInput
			bind:value={email}
			size="xl"
			type="email"
			name="email"
			placeholder="email@example.org"
			autocomplete="off"
			required
			disabled={$state === 'submitting'}
		/>
		<Button submit label="Subscribe" disabled={$state === 'submitting'} />
		<AlertList>
			<AlertItem displayWhen={$state === 'failed'}>{errorMessage}</AlertItem>
		</AlertList>
	</form>
{:else}
	<p>
		You have successfully joined our newsletter list and will begin receiving the lastest updates and insights from
		Trading Strategy.
	</p>
{/if}

<style lang="postcss">
	form {
		padding-block: var(--space-ss);
		display: grid;
		grid-template-columns: 1fr 7.5rem;
		gap: var(--space-ml) var(--space-ms);
		align-items: center;

		@media (--viewport-xs) {
			grid-template-columns: auto;
			gap: var(--space-md);
		}

		& :global .alert-list {
			grid-column: 1/-1;
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
