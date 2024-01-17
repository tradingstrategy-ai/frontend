import { error, text } from '@sveltejs/kit';

export async function GET({ params }) {
	const { fileName } = params;
	let tosText: string;

	if (!/^v\d+-[a-f0-9]{10}\.txt$/.test(fileName)) {
		throw error(404, 'Not found');
	}

	try {
		tosText = (await import(`/src/lib/trade-executor/tos/${fileName}?raw`)).default;
	} catch (e) {
		throw error(404, 'File not found');
	}

	return text(tosText, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
}
