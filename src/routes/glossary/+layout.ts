/**
 * Data loader for all /glossary routes
 */
export async function load({ fetch }) {
	const resp = await fetch('/glossary/api');

	if (!resp.ok) {
		console.log(resp.text());
		throw new Error(`Could not load glossary. See console log for details.`);
	}

	return {
		glossary: resp.json()
	};
}
