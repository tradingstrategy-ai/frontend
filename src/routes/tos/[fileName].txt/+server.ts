import { error, text } from '@sveltejs/kit';

export async function GET({ params }) {
	const { fileName } = params;

	let tosText: string;

	try {
		tosText = (await import(`$lib/assets/tos/${fileName}.txt?raw`)).default;
	} catch (e) {
		error(404, 'File not found');
	}

	return text(tosText, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
}
