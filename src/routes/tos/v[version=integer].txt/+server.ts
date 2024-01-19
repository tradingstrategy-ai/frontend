import { error, text } from '@sveltejs/kit';

export async function GET({ params }) {
	const { version } = params;

	let tosText: string;

	try {
		// vite dynamic import requires relative path
		tosText = (await import(`../../../lib/assets/tos/v${version}.txt?raw`)).default;
	} catch (e) {
		throw error(404, 'File not found');
	}

	return text(tosText, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
}
