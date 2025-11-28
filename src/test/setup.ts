import '@testing-library/jest-dom';
import { server } from './testServer';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Start MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Window confirm default to true in tests
if (!window.confirm) {
  // @ts-ignore
  window.confirm = () => true;
} else {
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
}
