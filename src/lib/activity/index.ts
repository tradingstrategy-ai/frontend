import { backendUrl } from '$lib/config';

// key for storing userId in localStorage
const USER_ID_KEY = 'userId';

// threshold (in ms) to skip requests of same type
const THROTTLE_THRESHOLD = 1000;

// store last request timestamp by type
const lastRequest: Record<string, number> = {};

// track activity to backend by type
export async function trackActivity(type: string) {
	// abort if last request too recent
	const t0 = lastRequest[type] || 0;
	const t1 = Date.now();
	if (t1 - t0 < THROTTLE_THRESHOLD) return;
	lastRequest[type] = t1;

	// POST to /activity endpoint
	const params = new URLSearchParams({ type, user_id: getUserId() });
	const url = `${backendUrl}/activity?${params}`;
	return fetch(url, { method: 'POST' });
}

// substitute characters for URL-safe base64
function urlSafeSubstitute(char: string) {
	// prettier-ignore
	switch (char) {
    case '+': return '-';
    case '/': return '_';
    case '=': return '';
    default : return char;
  }
}

// generates a v4 UUID in URL-safe base64 format (22 char string)
function generateUserId(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	const packed = String.fromCharCode(...bytes);
	const base64 = window.btoa(packed);
	return base64.replace(/[+/=]/g, urlSafeSubstitute);
}

function validUserId(id: string | null) {
	return id && /^[0-9a-zA-Z_-]{22}$/.test(id);
}

// get userId from localStorage or generate/set if none
function getUserId() {
	let userId = localStorage.getItem(USER_ID_KEY);
	if (!validUserId(userId)) {
		userId = generateUserId();
		localStorage.setItem(USER_ID_KEY, userId);
	}
	return <string>userId;
}
