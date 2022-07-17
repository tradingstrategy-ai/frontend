const imageAssets = import.meta.globEager('$lib/assets/**/*.{svg,png,jpg,jpeg}');

export function imageUrl(fileName: string): string {
	for (const key of Object.keys(imageAssets)) {
		if (key.endsWith(fileName)) return imageAssets[key].default;
	}
}
