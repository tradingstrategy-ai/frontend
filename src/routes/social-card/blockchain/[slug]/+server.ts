import { getChain } from '$lib/helpers/chain';
import { error } from '@sveltejs/kit';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

/** Render a local blockchain logo on a platform-safe PNG canvas. */
export async function GET({ params }) {
	const chain = getChain(params.slug);
	if (!chain) error(404, 'Blockchain logo not found');

	let logo: string;
	try {
		logo = (await import(`$lib/assets/logos/blockchains/${chain.slug}.svg?raw`)).default;
	} catch {
		error(404, 'Blockchain logo not found');
	}

	const resizedLogo = await sharp(Buffer.from(logo))
		.resize({ width: 420, height: 420, fit: 'inside' })
		.png()
		.toBuffer();
	const image = await sharp({
		create: {
			width: WIDTH,
			height: HEIGHT,
			channels: 4,
			background: '#ffffff'
		}
	})
		.composite([{ input: resizedLogo, gravity: 'centre' }])
		.png()
		.toBuffer();

	return new Response(new Uint8Array(image), {
		headers: {
			'cache-control': 'public, max-age=31536000, immutable',
			'content-type': 'image/png',
			'content-length': String(image.byteLength),
			'x-content-type-options': 'nosniff'
		}
	});
}
