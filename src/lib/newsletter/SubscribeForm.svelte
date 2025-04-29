<!--
@component
Embeddable <form> based component that allows subscribing to newsletter.

@example

```svelte
<SubscribeForm />
```
-->
<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { slide } from 'svelte/transition';
	import { turnstileSiteKey } from '$lib/config';
	import { Turnstile } from 'svelte-turnstile';
	import { enhance } from '$app/forms';
	import fsm from 'svelte-fsm';
	import { TextInput, Button, Alert } from '$lib/components';

	let email = $state('');

	let errorMessage = $state('');

	let resetCaptcha = $state<() => void>();

	// finite state machine to manage form states/transitions
	// see: https://github.com/kenkunz/svelte-fsm/wiki
	const form = fsm('initial', {
		initial: {
			_enter() {
				email = '';
			},

			focus: 'entering'
		},

		entering: {
			submit: 'submitting'
		},

		submitting: {
			success: 'subscribed',

			failure: 'failed',

			error: 'failed'
		},

		subscribed: {
			_enter() {
				form.reset.debounce(5000);
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

			input() {
				resetCaptcha?.();
				return 'entering';
			}
		}
	});

	/**
	 * Client-side progressively-enhanced form submit handling; see:
	 * https://kit.svelte.dev/docs/form-actions#progressive-enhancement
	 */
	const enhancedSubmit: SubmitFunction = () => {
		form.submit();
		// @ts-ignore
		return ({ result }) => form[result.type](result);
	};
</script>

{#if $form !== 'subscribed'}
	<form class="subscribe-form" method="POST" action="/newsletter?/subscribe" use:enhance={enhancedSubmit}>
		<div class="fields">
			<TextInput
				bind:value={email}
				size="xl"
				type="email"
				name="email"
				placeholder="email@example.org"
				autocomplete="off"
				required
				disabled={$form === 'submitting'}
				on:focus={form.focus}
				on:input={form.input}
			/>
			<Button submit label="Subscribe" disabled={$form === 'submitting' || $form === 'failed'} />
		</div>

		{#if $form === 'failed'}
			<div transition:slide>
				<Alert size="md">{errorMessage}</Alert>
			</div>
		{/if}

		{#if $form !== 'initial'}
			<div class="captcha" transition:slide>
				<Turnstile siteKey={turnstileSiteKey} bind:reset={resetCaptcha} />
			</div>
		{/if}
	</form>
{:else}
	<Alert status="success" size="md">
		You have successfully joined our newsletter list and will begin receiving the lastest updates and insights from
		Trading Strategy.
	</Alert>
{/if}

<style>
	.subscribe-form {
		display: grid;
		gap: inherit;

		.fields {
			--text-input-font: var(--f-mono-lg-regular);
			--text-input-letter-spacing: var(--f-mono-lg-spacing);
			padding-block: 0.5rem;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem 0.875rem;
			align-items: center;

			@media (--viewport-sm-down) {
				grid-template-columns: 1fr;
			}
		}

		.captcha {
			text-align: center;
			height: 71.5px;
		}
	}
</style>
