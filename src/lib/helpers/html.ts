const entities = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

export function escapeHtml(unsafe: string | null | undefined) {
	// @ts-ignore
	return unsafe ? unsafe.replace(/[&<>"']/g, (char) => entities[char]) : '';
}
