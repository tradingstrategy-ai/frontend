import sharp from 'sharp';

export const SOCIAL_CARD_WIDTH = 1200;
export const SOCIAL_CARD_HEIGHT = 630;
const SOCIAL_CARD_BACKGROUND = '#172554';

interface SocialCardLogoSize {
	width: number;
	height: number;
}

/**
 * Render an SVG logo centred on a social-preview PNG canvas.
 *
 * @param logo SVG logo source
 * @param size Maximum rendered logo dimensions
 */
export async function renderSocialCard(logo: string, size: SocialCardLogoSize): Promise<Buffer> {
	const resizedLogo = await sharp(Buffer.from(logo), { density: 288 })
		.resize({ ...size, fit: 'inside' })
		.png()
		.toBuffer();

	return sharp({
		create: {
			width: SOCIAL_CARD_WIDTH,
			height: SOCIAL_CARD_HEIGHT,
			channels: 4,
			background: SOCIAL_CARD_BACKGROUND
		}
	})
		.composite([{ input: resizedLogo, gravity: 'centre' }])
		.png()
		.toBuffer();
}

/**
 * Create the common response for generated social-card images.
 *
 * @param image Rendered PNG content
 */
export function socialCardResponse(image: Buffer): Response {
	return new Response(new Uint8Array(image), {
		headers: {
			'cache-control': 'public, max-age=31536000, immutable',
			'content-type': 'image/png',
			'content-length': String(image.byteLength),
			'x-content-type-options': 'nosniff'
		}
	});
}
