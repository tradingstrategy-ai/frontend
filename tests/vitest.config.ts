import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// always use mock config in unit tests
vi.mock('$lib/config');
