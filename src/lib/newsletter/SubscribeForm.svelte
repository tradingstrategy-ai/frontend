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
	import type { ColorMode } from '$lib/schemas/utility';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import { turnstileSiteKey } from '$lib/config';
	import fsm from 'svelte-fsm';
	import { Turnstile } from 'svelte-turnstile';
	import TextInput from '$lib/components/TextInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { getColorMode } from '$lib/helpers/style';

	interface Props {
		inputSize?: 'sm' | 'md' | 'lg' | 'xl';
		buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
	}

	const { inputSize = 'xl', buttonSize = 'md' }: Props = $props();

	let email = $state('');
	let errorMessage = $state('');
	let resetCaptcha = $state<() => void>();
	let colorMode = $state<ColorMode>('dark');

	// finite state machine to manage form states/transitions
	// see: https://github.com/kenkunz/svelte-fsm/wiki
	const form = fsm('initial', {
		initial: {
			_enter() {
				email = '';
			},

			focus: 'validating'
		},

		validating: {
			_enter({ from }) {
				colorMode = getColorMode();
				if (from !== 'initial') resetCaptcha?.();
			},

			confirm: 'valid',

			deny() {
				const message =
					'CAPTCHA validation failed. <a target="_blank" href="https://youtu.be/4VrLQXR7mKU">Are you a bot?</a>';
				form.error({ error: { message } });
			},

			error: 'failed'
		},

		valid: {
			submit: 'submitting'
		},

		submitting: {
			success: 'subscribed',

			failure: 'failed',

			error: 'failed'
		},

		subscribed: {
			_enter() {
				// @ts-ignore
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

			input: 'validating'
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
				size={inputSize}
				type="email"
				name="email"
				placeholder="email@example.org"
				autocomplete="off"
				required
				disabled={$form === 'submitting'}
				on:focus={form.focus}
				on:input={form.input}
			/>
			<Button size={buttonSize} submit label="Subscribe" disabled={$form !== 'valid'} />
		</div>

		{#if $form === 'failed'}
			<div transition:slide>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<Alert size="md">{@html errorMessage}</Alert>
			</div>
		{/if}

		{#if $form !== 'initial'}
			<div class="captcha" transition:slide>
				<Turnstile
					siteKey={turnstileSiteKey}
					theme={colorMode === 'system' ? 'auto' : colorMode}
					bind:reset={resetCaptcha}
					on:callback={form.confirm}
					on:error={form.deny}
				/>
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
