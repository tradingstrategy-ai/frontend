import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// always use mock config in unit tests
vi.mock('$lib/config');

// add a stub for `window.scrollTo`
vi.stubGlobal('scrollTo', vi.fn());

// add a stub for Element anaimate
Element.prototype.animate = vi.fn(() => ({
	finished: Promise.resolve(),
	cancel: vi.fn(),
	pause: vi.fn(),
	play: vi.fn(),
	reverse: vi.fn()
}));
