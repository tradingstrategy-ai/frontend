export async function load({ request }) {
	return {
		requestHeaders: Object.fromEntries(request.headers)
	};
}
