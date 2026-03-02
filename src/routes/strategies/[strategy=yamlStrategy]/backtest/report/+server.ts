/**
 * Serve backtest HTML report for a YAML-configured strategy.
 *
 * Looks up the raw HTML from the build-time backtest loader and optionally
 * injects a postMessage height script + CSS reset so the parent iframe
 * can auto-resize. Injection is controlled by the strategy's
 * `inject_backtest_iframe_resizer` config flag (defaults to true).
 */
import { error } from '@sveltejs/kit';
import { backtestHtml } from '$lib/strategies/yaml/backtest-loader';
import { yamlStrategies } from '$lib/strategies/yaml/loader';

const IFRAME_RESIZER_SNIPPET = `
<style>html, body { margin: 0; padding: 0; overflow: hidden; }</style>
<script>
(function() {
	function postHeight() {
		parent.postMessage({ iframeContentHeight: document.body.scrollHeight }, '*');
	}
	window.addEventListener('load', postHeight);
	new ResizeObserver(postHeight).observe(document.body);
})();
</script>`;

export function GET({ params }) {
	const html = backtestHtml.get(params.strategy);
	if (!html) error(404, 'Backtest report not found');

	const config = yamlStrategies.get(params.strategy);
	const inject = config?.inject_backtest_iframe_resizer ?? true;

	const content = inject ? html.replace('</body>', `${IFRAME_RESIZER_SNIPPET}\n</body>`) : html;

	return new Response(content, {
		headers: { 'Content-Type': 'text/html' }
	});
}
