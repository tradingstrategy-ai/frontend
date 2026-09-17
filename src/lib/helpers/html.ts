const entities = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

export function escapeHtml(unsafe: string | null | undefined) {
	return unsafe ? unsafe.replace(/[&<>"']/g, (char) => entities[char as keyof typeof entities]) : '';
}
