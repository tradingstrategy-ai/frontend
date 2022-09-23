const entities = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

export function escapeHtml(unsafe: string) {
	// @ts-ignore
	return unsafe.replace(/[&<>"']/g, (char) => entities[char]);
}
