<!--
@component
Embeddable <form> based component that allows subscribing to newsletter.

#### Usage:
```tsx
<SubscribeForm />
```
-->
<script lang="ts">
	import type { SubmitFunction } from '$app/forms';
	import { enhance } from '$app/forms';
	import fsm from 'svelte-fsm';
	import { TextInput, Button, AlertList, AlertItem } from '$lib/components';

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
</script>

{#if $state !== 'subscribed'}
	<form
		class="subscribe-form"
		bind:this={form}
		method="POST"
		action="/newsletter?/subscribe"
		use:enhance={enhancedSubmit}
	>
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
	</form>
	{#if $state === 'failed'}
		<AlertList>
			<AlertItem>{errorMessage}</AlertItem>
		</AlertList>
	{/if}
{:else}
	<p>
		You have successfully joined our newsletter list and will begin receiving the lastest updates and insights from
		Trading Strategy.
	</p>
{/if}

<style lang="postcss">
	.subscribe-form {
		padding-block: var(--space-ss);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, auto));
		gap: var(--space-ml) var(--space-ms);
		align-items: center;

		@media (--viewport-xs) {
			gap: var(--space-md);
		}

		& :global .alert-list {
			grid-column: 1/-1;
		}

		& :global input {
			font: var(--f-mono-lg-regular);
			letter-spacing: var(--f-mono-lg-spacing);
		}
	}
</style>
