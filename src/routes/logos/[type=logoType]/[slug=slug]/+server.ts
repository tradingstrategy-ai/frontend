import { error, text } from '@sveltejs/kit';

export async function GET({ params }) {
	const { type, slug } = params;

	let data: string;

	try {
		data = (await import(`$lib/assets/logos/${type}/${slug}.svg?raw`)).default;
	} catch (e) {
		error(404, 'File not found');
	}

	return text(data, {
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
}
