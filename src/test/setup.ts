import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Basic localStorage shim for environments where jsdom doesn't provide it (e.g., worker threads)
if (typeof globalThis.localStorage !== 'object' || typeof globalThis.localStorage?.getItem !== 'function') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    }
  } as unknown as Storage;
}

// MSW server is loaded lazily so the localStorage shim above is in place first
let server: typeof import('./testServer')['server'];
beforeAll(async () => {
  const mod = await import('./testServer');
  server = mod.server;
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => {
  server?.resetHandlers();
});
afterAll(() => {
  server?.close();
});

// Window confirm default to true in tests
if (!window.confirm) {
  // @ts-ignore
  window.confirm = () => true;
} else {
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
}
