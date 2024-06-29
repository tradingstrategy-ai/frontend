import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// always use mock config in unit tests
vi.mock('$lib/config');

// add a stub for `window.scrollTo`
vi.stubGlobal('scrollTo', vi.fn());
