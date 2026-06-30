import { vi } from 'vitest';

// Global mocks for backend tests
vi.mock('../utils/firebase', () => ({
  auth: {
    verifyIdToken: vi.fn(),
  },
}));

vi.mock('xss-clean', () => ({
  default: () => (req: any, res: any, next: any) => next()
}));
