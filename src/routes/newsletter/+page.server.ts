import type { Actions } from './$types';
import { env } from '$env/dynamic/private';
import { fail, isActionFailure } from '@sveltejs/kit';
import { getClient } from '$lib/newsletter/client';

async function verifyCaptcha(fetch: Fetch, data: FormData, headers: Headers) {
	const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

	const body = new URLSearchParams({
		secret: env.TS_PRIVATE_TURNSTILE_SECRET_KEY,
		response: data.get('cf-turnstile-response') as string,
		remoteip: headers.get('CF-Connecting-IP') ?? '',
		idempotency_key: crypto.randomUUID()
	});

	const resp = await fetch(url, { method: 'POST', body });
	const respPayload = await resp.json();

	if (!respPayload.success) {
		return fail(400, { message: 'CAPTCHA verification failed' });
	}

	return { success: true };
}

async function subscribeTosNewsletter(fetch: Fetch, data: FormData, headers: Headers) {
	const newsletter = getClient(fetch);

	const resp = await newsletter.subscribe({
		email: data.get('email') as string,
		ip_address: headers.get('CF-Connecting-IP'),
		fields: {
			country: headers.get('CF-IPCountry')
		}
	});

	if (!resp.ok) return fail(resp.status, resp.payload);

	return { success: true };
}

export const actions = {
	subscribe: async ({ request, fetch }) => {
		const data = await request.formData();
		const headers = request.headers;

		const captchaResult = await verifyCaptcha(fetch, data, headers);

		if (isActionFailure(captchaResult)) return captchaResult;

		return subscribeTosNewsletter(fetch, data, headers);
	}
} satisfies Actions;
