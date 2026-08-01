import logo from '$lib/assets/logo-horizontal.svg?raw';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

/** Render a platform-safe Trading Strategy fallback card as a large PNG. */
export async function GET() {
	const resizedLogo = await sharp(Buffer.from(logo))
		.resize({ width: 900, height: 300, fit: 'inside' })
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
