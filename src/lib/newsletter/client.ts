/**
 * MailerLite REST API client
 *
 * see: https://developers.mailerlite.com/docs/#mailerlite-api
 */
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const mailerLiteConfig = ((apiUrl, apiKey, groupsStr) => {
	if (!apiUrl || !apiKey) return;

	// one or more groups (comma-separated)
	const groups = groupsStr ? groupsStr.split(/\s*,\s*/) : [];

	return { apiUrl, apiKey, groups };
})(env.TS_PRIVATE_MAILERLITE_URL, env.TS_PRIVATE_MAILERLITE_API_KEY, env.TS_PRIVATE_MAILERLITE_GROUPS);

type Nullable<Type> = Type | null;

export type SubscriberFields = {
	name?: Nullable<string>;
	last_name?: Nullable<string>;
	country?: Nullable<string>;
};

export type Subscriber = {
	email: string;
	ip_address?: Nullable<string>;
	fields: Nullable<SubscriberFields>;
};

export function getClient(fetch: Fetch) {
	async function subscribe(subscriber: Subscriber) {
		if (!mailerLiteConfig) {
			throw error(401, { message: 'MailerLite URL and/or API key not defined.' });
		}

		const headers = {
			'content-type': 'application/json',
			accept: 'application/json',
			authorization: `Bearer ${mailerLiteConfig.apiKey}`
		};

		const payload = {
			...subscriber,
			groups: mailerLiteConfig.groups
		};

		const resp = await fetch(`${mailerLiteConfig.apiUrl}/api/subscribers`, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload)
		});

		const respPayload = await resp.json();

		return {
			ok: resp.ok,
			status: resp.status,
			statusText: resp.statusText,
			payload: respPayload
		};
	}

	return { subscribe };
}
