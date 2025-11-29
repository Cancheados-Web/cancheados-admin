import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AxiosError } from 'axios';
import { api, authApi, tokenManager } from '../lib/api';

describe('API utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/', pathname: '/dashboard' }
    });
  });

  it('stores and clears auth tokens via tokenManager', () => {
    tokenManager.setToken('abc');
    tokenManager.setUser({ id: 'u1', email: 'user@test.com' });

    expect(tokenManager.getToken()).toBe('abc');
    expect(tokenManager.getUser()).toMatchObject({ email: 'user@test.com' });

    tokenManager.clear();
    expect(tokenManager.getToken()).toBeNull();
    expect(tokenManager.getUser()).toBeNull();
  });

  it('adds bearer token in the request interceptor', async () => {
    tokenManager.setToken('secret');
    const [handler] = (api.interceptors.request as any).handlers;
    const config = await handler.fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer secret');
  });

  it('clears tokens and redirects on 401 from auth endpoints', async () => {
    tokenManager.setToken('token-123');
    tokenManager.setUser({ id: 'u1', email: 'user@test.com', is_admin: true });

    const responseHandler = (api.interceptors.response as any).handlers[0];

    const error: AxiosError = {
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Unauthorized',
      config: { url: '/api/auth/login' },
      toJSON: () => ({}),
      response: {
        status: 401,
        data: { error: 'Unauthorized', message: 'nope' },
        statusText: 'Unauthorized',
        headers: {},
        config: {}
      }
    };

    await responseHandler.rejected(error).catch(() => {});

    expect(tokenManager.getToken()).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('persists tokens after a successful login call', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        tokens: { accessToken: 'jwt-abc' },
        user: { id: 'admin-1', email: 'admin@test.com', nombre: 'Admin', is_admin: true }
      }
    } as any);

    const result = await authApi.login({ email: 'admin@test.com', password: 'Passw0rd!' });

    expect(postSpy).toHaveBeenCalledWith('/api/auth/login', { email: 'admin@test.com', password: 'Passw0rd!' });
    expect(result.user.email).toBe('admin@test.com');
    expect(tokenManager.getToken()).toBe('jwt-abc');
    expect(tokenManager.getUser()?.is_admin).toBe(true);
  });
});
