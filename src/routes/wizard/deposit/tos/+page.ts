export async function load({ fetch }) {
	// TODO: this value will come from the terms of service contract
	const version = '0';

	let tosText: string | undefined;

	try {
		const resp = await fetch(`/tos/v${version}.txt?`);
		if (!resp.ok) throw new Error(resp.statusText);
		tosText = await resp.text();
	} catch (e) {
		console.error(e);
	}

	return { version, tosText };
}
