import { defineMock } from 'vite-plugin-mock-dev-server';

// SVG placeholder for sparklines - a simple upward-trending line
const sparklineSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30">
  <polyline points="0,25 20,20 40,22 60,15 80,10 100,12" stroke="#4ade80" fill="none" stroke-width="2"/>
</svg>`;

export default defineMock({
	url: '/api/top-vaults/sparklines/:filename',
	type: 'image/svg+xml',
	body: sparklineSvg
});
